from flask import Flask, request, jsonify
from flask_cors import CORS
from data_loader import fetch_stock_data
from risk_metrics import calculate_metrics
from simulation import run_monte_carlo
from portfolio import calculate_portfolio_metrics

app = Flask(__name__)
CORS(app) 

@app.route('/api/simulate', methods=['POST'])
def simulate_stock():
    data = request.json
    ticker = data.get('ticker')
    
    # Grab the user's custom inputs from the web page
    days = data.get('days', 252)
    sims = data.get('sims', 1000)
    custom_price = data.get('price')
    
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400
        
    stock_data = fetch_stock_data(ticker)
    if not stock_data:
        return jsonify({"error": f"Could not fetch data for {ticker}. Check the symbol."}), 400
        
    # If user entered an investment amount/price, use it. Otherwise, use live stock price.
    try:
        starting_price = float(custom_price) if custom_price else stock_data['current_price']
        days = int(days)
        sims = int(sims)
    except ValueError:
        return jsonify({"error": "Invalid numerical parameters provided."}), 400

    metrics = calculate_metrics(stock_data['returns'])
    if not metrics:
        return jsonify({"error": "Not enough data to calculate metrics."}), 400
        
    # Run the math with all the custom user inputs
    simulation_results = run_monte_carlo(
        current_price=starting_price,
        daily_return=metrics['daily_return'],
        daily_volatility=metrics['daily_volatility'],
        days_to_simulate=days,
        num_simulations=sims
    )
    
    return jsonify({
        "ticker": ticker,
        "current_price": starting_price,
        "metrics": metrics,
        "simulation": simulation_results
    })

@app.route('/api/portfolio', methods=['POST'])
def analyze_portfolio():
    data = request.json
    tickers = data.get('tickers', ['RELIANCE.NS', 'TCS.NS', 'INFY.NS']) 
    weights = data.get('weights', [])
    
    if not weights:
        return jsonify({"error": "No weights provided."}), 400
        
    try:
        weights = [float(w) for w in weights]
    except ValueError:
        return jsonify({"error": "Invalid weights format."}), 400
        
    portfolio_results = calculate_portfolio_metrics(tickers, weights)
    
    if "error" in portfolio_results:
        return jsonify(portfolio_results), 400
    return jsonify(portfolio_results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)