# Module: biz/home.py
# Description: Defines functions to interact with the database for the home page.

from __main__ import app
import os, sys
import datetime

# Following Lines are for assigning parent directory dynamically.
# Citation: https://askubuntu.com/questions/1163847/modulenotfounderror-while-importing-module-from-parent-folder
dir_path = os.path.dirname(os.path.realpath(__file__))
parent_dir_path = os.path.abspath(os.path.join(dir_path, os.pardir))
sys.path.insert(0, parent_dir_path)

from db_connector.db_connector import connect_to_database, execute_query


def create_new_message_and_voice(data = None):
    '''
    Creates a new message and voice row in the database.
    Args: data (object): request object from front end input form including:
            mood (int): required
            audio (binary blob): required
            name (str): optional
            age (int): optional
            location (str): optional
    Returns: None
    '''
    try:
        if not data:
            raise Exception('Create New Message Error: Data required to insert new voice message')

        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        mood = data['mood']     #required
        audio = data['audio']   #required
        url = data['url']       #required
        name = data['name']
        age = data['age']
        location = data['location']

        # connect to db
        db_conn = connect_to_database()

        # form query string with optional fields to insert new message data
        query = 'INSERT INTO messages (message_date, message_url, user_mood, user_name, user_age, user_location) \
                VALUES ("{}", "{}", {}'.format(now, url, mood)

        if name:
            query += ', "{}"'.format(name)
        else:
            query += ', null'

        if age:
            query += ', {}'.format(age)
        else:
            query += ', null'

        if location:
            query += ', "{}"'.format(location)
        else:
            query += ', null'

        query += ')'

        result = execute_query(db_conn, query)

        # now insert new voice recording linked to new message row created
        query = 'INSERT INTO voices (message_id, voice_message) VALUES ({}, "{}")'.format(result.lastrowid, audio)
        result = execute_query(db_conn, query)

    except Exception as e:
        raise Exception(e)


def get_all_messages():
    '''
    Retrieves data about all messages from the database.
    Args: None
    Returns: resulting rows (list of tuples): All messages data.
    '''
    try:
        # connected to db
        db_conn = connect_to_database()

        # get all messages from db
        query = 'SELECT * FROM messages'
        results = execute_query(db_conn, query)
        rows = results.fetchall()

        # rows[1] = change_time_format(rows[1])

        return rows
    except Exception as e:
        raise Exception(e)


def get_all_messages_in_date_range(start_date = None, end_date = None):
    '''
    Retrieves data about all messages from the database within specified date range.
    Args (required): start_date (date str): starting date of range of messages.
                     end_date (date str): ending date of range of messages.
    Returns: resulting rows (list): Messages in date range.
    '''
    try:
        if not start_date or not end_date:
            raise Exception('Start date and end date required.')

        # connect to db
        db_conn = connect_to_database()

        # query for messages in date range
        query = 'SELECT * FROM messages WHERE message_date >= {} AND message_date <= {}'.format(start_date, end_date)
        results = execute_query(db_conn, query)
        rows = results.fetchall()
        print("%s", rows[1])
        rows[1] = change_Time_format(rows[1])
        print("%s", rows[1])
        return rows
    except Exception as e:
        raise Exception(e)


def get_count_of_messages_in_date_range(start_date = None, end_date = None):
    '''
    Retrieves count of messages associated with a date within a given date range.
    Args (required): start_date (date str): starting date of range of messages.
                     end_Date (date str): ending date of range of messages.
    Returns: resulting rows (list): count of messages associated with specific date.
    '''
    try:
        if not start_date or not end_date:
            raise Exception('Start date and end date required.')

        # connect to db
        db_conn = connect_to_database()

        # escape the date_format '%' with '%%'
        query = 'SELECT DATE_FORMAT(tbl_1.message_date, "%%Y-%%m-%%d") AS m_date, COUNT(tbl_1.message_id) AS qty \
        FROM (SELECT * FROM messages WHERE message_date >= {} AND message_date <= {}) AS tbl_1 \
        GROUP BY m_date \
        ORDER BY m_date ASC'.format(start_date, end_date)

        results = execute_query(db_conn, query)
        rows = results.fetchall()

        return rows
    except Exception as e:
        raise Exception(e)

def change_time_format(time = None):
  date_time = time.strip()
  format
  format_time = date_time[1].strptime(time, "%H:%M")
  formatted = date_time[0] + format_time.strftime("%I:%M %p")
  return formatted
