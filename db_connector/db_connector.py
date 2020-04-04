# db_connectory.py
# Description: Functions to connect to the database and execute queries.
# Citation: https://github.com/knightsamar/CS340_starter_flask_app/blob/master/db_connector/db_connector.py

# TODO: Sanitize the queries to properly use .execute() instead of string interpolation to avoid SQL injections

#from dotenv import load_dotenv
#import mysql.connector as mariadb
#import mariadb as MySQLdb
import MySQLdb
import os

# get database credentials from .env
# load_dotenv()
# USERNAME = os.getenv("USERNAME")
# PASSWORD = os.getenv("PASSWORD")
# HOST = os.getenv("HOST")
# DB_NAME = os.getenv("DB_NAME")
USERNAME="noah"
PASSWORD="noahnoahnoah"
HOST=""
DB_NAME="com_unity"


def connect_to_database(host = HOST, user = USERNAME, passwd = PASSWORD, db = DB_NAME):
    '''
    Connects to database and returns the database object
    Args (all defaults are from environment variables):
        host (str): name of db host
        user (str): user account in db
        passwd (str): password of user account
        db (str): database name
    Returns:
        db_connection (object): a connected database object
    '''
    db_connection = MySQLdb.connect(host, user, passwd, db)
    return db_connection


def execute_query(db_connection = None, query = None, query_params = ()):
    '''
    Executes a given SQL query on given db connection and returns a Cursor object
    Args:
        db_connection (object - DEFAULT: None): connected database object
        query (str - DEFAULT: None): SQL query to be executed
        query_params (tuple of arguments - DEFAULT: None): Arguments to SQL query to be executed
    Returns:
        cursor (object): Database cursor object to retrieve query results.
        As defined by https://www.python.org/dev/peps/pep-0249/#cursor-objects.
        You need to run .fetchall() or .fetchone() on that object to access results.
    '''
    if db_connection is None:
        print("No database connection. Be sure to call connect_to_database() first.")
        return None

    if query is None or len(query.strip()) == 0:
        print("Empty query. SQL query is required to use execute_query.")
        return None

    # Create a cursor to execute the query.
    # "Because apparently they optimize execution by retaining a reference according to PEP0249". -- knightsamar
    cursor = db_connection.cursor()

    # Execute query
    cursor.execute(query, query_params)

    # Commit changes to database, otherwise changes will not be committed.
    db_connection.commit()

    return cursor
