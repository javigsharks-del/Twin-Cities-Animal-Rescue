javascript
/**
 * Twin Cities Animal Rescue - Volunteer/Foster Application Interactivity
 * Course: Introduction to Web Development
 * Student: Javier Garza
 * Date: November 10, 2026
 */

// Object structure to manage the real-time application data state
const applicationDraft = {
    name: "",
    email: "",
    preference: "",
    experience: ""
};

// Key used for storage synchronization
const STORAGE_KEY = "tcar_volunteer_draft";

// Document Elements
let form, nameInput, emailInput, prefSelect, expTextArea, dynamicFeedback;

/**
 * Initialize application logic once the DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
    // Map elements to global variables using your exact HTML field IDs
    form = document.querySelector('form.application-form') || document.querySelector('form[action="#"]') || document.querySelector('form');
    if (!form) return; // Exit safely if not on the form page

    // Prevent native browser tooltips from blocking your custom JavaScript modal
    form.setAttribute("novalidate", true);

    nameInput = document.getElementById("fullname") || document.getElementById("name");
    emailInput = document.getElementById("email");
    prefSelect = document.getElementById("interest") || document.getElementById("area-of-interest");
    expTextArea = document.getElementById("comments") || document.getElementById("about") || document.getElementById("bio") || document.querySelector("textarea");
    
    // Create and inject a dynamic feedback div for foster notifications underneath the interest selector
    dynamicFeedback = document.createElement("div");
    dynamicFeedback.style.marginTop = "10px";
    dynamicFeedback.style.marginBottom = "15px";
    dynamicFeedback.style.fontWeight = "bold";
    dynamicFeedback.style.color = "#2b6cb0"; // Slate blue accent color
    if (prefSelect && prefSelect.parentNode) {
        prefSelect.parentNode.insertBefore(dynamicFeedback, prefSelect.nextSibling);
    }

    // Initialize event listeners
    setupEventListeners();

    // Load any existing saved drafts from the browser engine
    loadSavedDraft();
});

/**
 * Binds input and submission event listeners to separate structure from behavior
 */
function setupEventListeners() {
    // Real-time tracking and sync
    form.addEventListener("input", handleFormInput);
    
    // Conditional logic target
    if (prefSelect) {
        prefSelect.addEventListener("change", checkPreferenceCondition);
    }

    // Intercept form submission for validation and custom summary modal
    form.addEventListener("submit", handleFormSubmit);
}

/**
 * Synchronizes real-time field edits to the state object and browser localStorage
 * @param {Event} event - The input event object
 */
function handleFormInput(event) {
    const target = event.target;
    if (!target) return;

    // Update real-time state object based on elements
    if (target === nameInput) applicationDraft.name = target.value;
    if (target === emailInput) applicationDraft.email = target.value;
    if (target === prefSelect) applicationDraft.preference = target.value;
    if (target === expTextArea) applicationDraft.experience = target.value;

    // Clean up error states dynamically as the user fixes mistakes
    clearFieldError(target);

    // Provide visual inline validation feedback (green markers) for real-time progress tracking
    if (target === nameInput || target === emailInput) {
        if (target.value.trim().length > 0) {
            target.style.borderColor = "#28a745"; // Success green layout accent
        } else {
            target.style.borderColor = "";
        }
    }

    // Serialize object to a structural JSON string to avoid [object Object] storage bugs
    saveToLocalStorage();
}

/**
 * Evaluates the chosen dropdown role to show specific layout text updates
 */
function checkPreferenceCondition() {
    if (!prefSelect || !dynamicFeedback) return;

    // Trigger explicit visibility state updates for your animal foster care option
    if (prefSelect.value === "foster" || prefSelect.value.includes("Foster")) {
        dynamicFeedback.textContent = "🐾 Excellent choice! Our Animal Foster Care Program requires a separate structural home check orientation.";
        dynamicFeedback.style.display = "block";
    } else {
        dynamicFeedback.textContent = "";
        dynamicFeedback.style.display = "none";
    }
}

/**
 * Saves current data object into browser storage
 */
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applicationDraft));
}

/**
 * Reads local storage data, handles type conversions safely, and restores input values
 */
function loadSavedDraft() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return;

    try {
        // Parse the valid structural text back into the application state object
        const savedState = JSON.parse(rawData);
        
        // Deep copy properties over to master tracking state
        Object.assign(applicationDraft, savedState);

        // Pre-fill actual HTML input elements natively across page loading instances
        if (nameInput && applicationDraft.name) nameInput.value = applicationDraft.name;
        if (emailInput && applicationDraft.email) emailInput.value = applicationDraft.email;
        if (prefSelect && applicationDraft.preference) {
            prefSelect.value = applicationDraft.preference;
            checkPreferenceCondition(); // Run check immediately to display correct layout block view
        }
        if (expTextArea && applicationDraft.experience) expTextArea.value = applicationDraft.experience;

        // Apply success borders to restored valid items
        if (nameInput && nameInput.value) nameInput.style.borderColor = "#28a745";
        if (emailInput && emailInput.value) emailInput.style.borderColor = "#28a745";

    } catch (error) {
        console.error("Error formatting saved draft stream:", error);
    }
}

/**
 * Intercepts submission, runs logic arrays, and handles successful completion modals
 * @param {Event} event - Submission event target link
 */
function handleFormSubmit(event) {
    event.preventDefault(); // Stop default action immediately to prevent empty page reloads

    let isFormValid = true;

    // 1. Name field check
    if (nameInput) {
        if (nameInput.value.trim() === "") {
            showFieldError(nameInput, "Full Name is required.");
            isFormValid = false;
        }
    }

    // 2. Email Format Check (Regex Match)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput) {
        if (!emailRegex.test(emailInput.value.trim())) {
            showFieldError(emailInput, "Please enter a valid email address (e.g., name@example.com) so our coordinators can reach you.");
            isFormValid = false;
        }
    }

    // 3. Dropdown Selection Check
    if (prefSelect) {
        if (prefSelect.value === "") {
            showFieldError(prefSelect, "Please select an Area of Interest from the dropdown.");
            isFormValid = false;
        }
    }

    // 4. Minimum Text Area Character Range Check (15 characters)
    if (expTextArea) {
        if (expTextArea.value.trim().length < 15) {
            showFieldError(expTextArea, "Please tell us a bit more about your background (minimum 15 characters required).");
            isFormValid = false;
        }
    }

    // Complete actions successfully if all validation hurdles pass smoothly
    if (isFormValid) {
        displaySuccessModal();
    }
}

/**
 * Generates and prints clear validation errors below specific invalid fields
 * @param {HTMLElement} inputElement - Target invalid structural element link
 * @param {string} message - Clear error feedback string text to quote
 */
function showFieldError(inputElement, message) {
    clearFieldError(inputElement); // Clear to avoid repetitive stacked message blocks

    inputElement.style.borderColor = "#dc3545"; // Validation error alert red border

    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error-msg";
    errorDiv.style.color = "#dc3545";
    errorDiv.style.fontSize = "0.9em";
    errorDiv.style.fontWeight = "bold";
    errorDiv.style.marginTop = "-15px";
    errorDiv.style.marginBottom = "15px";
    errorDiv.textContent = message;

    if (inputElement.parentNode) {
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
}

/**
 * Completely clears field error markers
 * @param {HTMLElement} inputElement - Targeted node link reference
 */
function clearFieldError(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = "";
    const container = inputElement.parentNode;
    if (container) {
        const structuralErrorMessage = container.querySelector(".field-error-msg");
        if (structuralErrorMessage) {
            container.removeChild(structuralErrorMessage);
        }
    }
}

/**
 * Constructs a fully dynamic custom summary message modal overlapping the completed page layout view
 */
function displaySuccessModal() {
    const travelerName = nameInput ? nameInput.value.trim() : "Volunteer";

    // Overlay background box layout setup wrapper
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100vw";
    modalOverlay.style.height = "100vh";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.zIndex = "9999";

    // Interactive message prompt container content
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#f7f9fa";
    modalContent.style.padding = "30px";
    modalContent.style.borderRadius = "8px";
modalContent.style.maxWidth = "500px";
modalContent.style.width = "90%";
modalContent.style.textAlign = "center";
modalContent.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
modalContent.style.fontFamily = "Arial, Helvetica, sans-serif";
const modalTitle = document.createElement("h2");
modalTitle.style.color = "#1a365d";
modalTitle.style.marginBottom = "15px";
modalTitle.textContent = "Application Saved!";
const modalBody = document.createElement("p");
modalBody.style.color = "#2d3748";
modalBody.style.lineHeight = "1.5";
modalBody.innerHTML = `Thank you, <strong>${travelerName}</strong>! Your application details have been recorded locally. Our onboarding system is tracking this setup properly.`;
// Modal interaction button
const closeButton = document.createElement("button");
closeButton.textContent = "Return to Site";
closeButton.style.margin = "20px auto 0 auto";
closeButton.style.display = "block";
closeButton.style.padding = "10px 20px";
closeButton.style.backgroundColor = "#2b6cb0";
closeButton.style.color = "#ffffff";
closeButton.style.border = "none";
closeButton.style.borderRadius = "4px";
closeButton.style.cursor = "pointer";
closeButton.style.fontWeight = "bold";
closeButton.addEventListener("click", () => {
document.body.removeChild(modalOverlay);
// Reset full local tracking state values upon successfully recording complete verified profiles
if (form) form.reset();
localStorage.removeItem(STORAGE_KEY);
// Reset element styles back to native baseline
if (nameInput) nameInput.style.borderColor = "";
if (emailInput) emailInput.style.borderColor = "";
if (dynamicFeedback) {
dynamicFeedback.textContent = "";
dynamicFeedback.style.display = "none";
}
});
// Structure modal branches hierarchically
modalContent.appendChild(modalTitle);
modalContent.appendChild(modalBody);
modalContent.appendChild(closeButton);
modalOverlay.appendChild(modalContent);
// Inject the final dynamic asset straight into structural document trees
document.body.appendChild(modalOverlay);
}
