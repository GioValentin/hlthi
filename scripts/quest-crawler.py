from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import time
import tempfile

# Setup Chrome options (optional)
options = Options()
# options.add_argument('--headless')  # Uncomment to run headless
# options.add_argument('--disable-gpu')  # Needed for headless on Windows
options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
temp_profile = tempfile.TemporaryDirectory()
options.add_argument(f"--user-data-dir={temp_profile.name}")
# Initialize driver with service and options
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

# Configuration
cas_login_url = "https://auth2.questdiagnostics.com/cas/login"
home_url = "https://physician.quanum.questdiagnostics.com/home"
form_url = "https://physician.quanum.questdiagnostics.com/add-patient-io"
username = "giovalentin"
password = "#94hkyUsf2030!"



# Patient Data
patient_data = {
    "lastName": "Valentin",
    "firstName": "Niko",
    "dob": "06/18/2023",
    "pid": "d2ee34a7-8a44-4958-b83c-59f178f96d45",
    "ssn": "123-45-6789",
    "sex": "Male",
    "genderIdentity": "Male",
    "sexualOrientation": "Heterosexual",
    "ethnicity": "Not Hispanic or Latino",
    "race": "White"
}

def click_continue_if_present():
    try:
        continue_button = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, '//a[contains(@class, "qd-error-page__button") and contains(text(), "Continue")]'))
        )
        continue_button.click()
        print("⚠️ 'Continue' button detected and clicked.")
    except TimeoutException:
        print("✅ No 'Continue' button present.")

try:
   # Start browser
    driver.maximize_window()
    driver.get(cas_login_url)

    # --- Step 1: Log in ---
    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.NAME, "username"))).send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.ID, "signin").click()

    # Detect if CAS-only login success page is shown
    # Detect if stuck on CAS-only login success page
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.ID, "authenticatedUserName"))
        )
        print("⚠️ Detected CAS-only login page. Navigating manually to physician app.")
        driver.get("https://physician.quanum.questdiagnostics.com/home")
    except TimeoutException:
        print("✅ No CAS-only page detected. Proceeding normally.")

    click_continue_if_present()

    try:
        WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        ).click()
        print("✅ Cookie consent dismissed.")
    except:
        print("⚠️ Cookie banner not found or already dismissed.")

    
    print("✅ Physician portal loaded successfully.")

    print("✅ User context fully initialized.")
    # --- Step 3: Go to form page ---
    driver.get(home_url)

    # --- Step 2: Wait for redirect ---
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "qd-home"))
    )

    # --- Helper Functions ---
    def fill_input_by_formcontrol(name, value):
        field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, f'[formcontrolname="{name}"]'))
        )
        field.clear()
        field.send_keys(value)

    def select_first_dropdown_option_by_formcontrol(name):
        dropdown = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, f'[formcontrolname="{name}"]'))
        )
        dropdown.click()

        # Refetch the element after dropdown opens
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "mat-option"))
        )

        first_option = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "(//mat-option)[1]"))
        )
        first_option.click()

    def select_dropdown_by_formcontrol(name, visible_text):
        # Click the dropdown
        dropdown = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, f'[formcontrolname="{name}"]'))
        )
        dropdown.click()

        # Wait for the overlay to be attached
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "mat-select-panel"))
        )

        # Click the specific mat-option by text
        option = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//mat-option/span[normalize-space()='{visible_text}']")
            )
        )
        option.click()

        # Ensure dropdown closes before continuing
        WebDriverWait(driver, 5).until_not(
            EC.presence_of_element_located((By.CLASS_NAME, "mat-select-panel"))
        )

    add_patient_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//button[.//span[contains(text(), "Add New Patient")]]'))
    )
    add_patient_button.click()
    print("✅ Clicked 'Add New Patient' button.")

    # --- Step 4: Fill form ---
    fill_input_by_formcontrol("lastName", patient_data["lastName"])
    fill_input_by_formcontrol("firstName", patient_data["firstName"])
    fill_input_by_formcontrol("dob", patient_data["dob"])
    fill_input_by_formcontrol("pid", patient_data["pid"])
    # fill_input_by_formcontrol("ssn", patient_data["ssn"])
    select_dropdown_by_formcontrol("sex", patient_data["sex"])
    
    select_first_dropdown_option_by_formcontrol("genderIdentity")
    time.sleep(0.3)
    select_first_dropdown_option_by_formcontrol("sexualOrientation")
    time.sleep(0.3)
    select_first_dropdown_option_by_formcontrol("ethnicity")
    time.sleep(0.3)
    select_first_dropdown_option_by_formcontrol("race")

    # Close any open dropdowns by clicking a neutral part of the form
    try:
        neutral_element = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "h1, h2, .page-title, .form-section-label"))
        )
        neutral_element.click()
        time.sleep(0.5)  # slight delay to let blur settle
    except:
        print("⚠️ Could not find a neutral element to click. Proceeding anyway.")

    # --- Step 5: Submit the form ---
    save_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Save Changes']]"))
    )
    #save_button.click()

    # --- Optional: wait to observe the result ---
    driver.quit()
    
except TimeoutException as e:
    print(f"❌ Timeout waiting for an element: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

finally:
    try:
        # Wait for overlays to disappear
        WebDriverWait(driver, 10).until_not(
            EC.presence_of_element_located((By.CLASS_NAME, "cdk-overlay-backdrop"))
        )

        # Re-locate and click menu button
        menu_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[aria-label="Account Settings"]'))
        )
        menu_button.click()
        time.sleep(1)

        # Re-locate and click Sign Out button
        signout_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//button[.//span[text()="Sign Out"]]'))
        )
        signout_button.click()
        print("✅ Signed out.")
    except (TimeoutException, NoSuchElementException) as e:
        print(f"⚠️ Could not sign out cleanly: {e}")
    finally:
        driver.quit()
        temp_profile.cleanup() 