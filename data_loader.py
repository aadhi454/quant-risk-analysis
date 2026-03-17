import yfinance as yf

def get_stock_data(ticker):
    stock = yf.download(ticker, period="5y")

    # Fix multi-index issue
    if isinstance(stock.columns, type(stock.columns)):
        try:
            stock.columns = stock.columns.droplevel(1)
        except:
            pass

    return stock