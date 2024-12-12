from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Set up the WebDriver
driver = webdriver.Chrome()  # or webdriver.Firefox() for Firefox

# Test Registration
def test_registration():
    driver.get("http://127.0.0.1:5000/register")
    driver.find_element(By.NAME, "username").send_keys("newuser")
    driver.find_element(By.NAME, "password").send_keys("password")
    driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
    driver.find_element(By.NAME, "submit").click()
    time.sleep(2)  # wait for the response
    assert "Registration Successful" in driver.page_source

# Test Login
def test_login():
    driver.get("http://127.0.0.1:5000/api/auth/login")
    driver.find_element(By.NAME, "username").send_keys("newuser")
    driver.find_element(By.NAME, "password").send_keys("password")
    driver.find_element(By.NAME, "submit").click()
    time.sleep(2)  # wait for the response
    assert "Welcome" in driver.page_source

# Run the tests
test_registration()
test_login()

# Close the WebDriver
driver.quit()
