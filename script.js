// Simple script to handle active states on sidebar navigation
// Ideal for demonstrating functionality without full routing

document.addEventListener("DOMContentLoaded", () => {
    // Select all navigation links
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default for prototype UI unless it's a real link
            if (this.getAttribute('href') === '#' || this.getAttribute('href') === '') {
                e.preventDefault();
            } else if (this.getAttribute('href') === 'index.html') {
                return; // Let logout happen
            }
            
            // Remove 'active' class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add 'active' class to the currently clicked link
            this.classList.add('active');
            
            // Handle section switching
            if (this.textContent === 'Symptom Checker') {
                showSymptomChecker();
            } else if (this.textContent === 'Home') {
                showHome();
            } else if (this.textContent === 'Emergency') {
                showSection('emergency-section', 'Emergency');
            } else {
                console.log(`User selected: ${this.textContent} view...`);
            }
        });
    });
});

function hideAllSections() {
    const sections = ['home-section', 'symptom-section', 'recommendations-section', 'emergency-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showSection(sectionId, titleText) {
    hideAllSections();
    const el = document.getElementById(sectionId);
    if (el) el.style.display = 'block';
    updateSidebarActiveState(titleText);
}

function showSymptomChecker() {
    showSection('symptom-section', 'Symptom Checker');
    // reset UI
    const input = document.getElementById('symptomsInput');
    if(input) input.value = '';
    const resultDiv = document.getElementById('analysisResult');
    if(resultDiv) resultDiv.style.display = 'none';
}

function showHome() {
    showSection('home-section', 'Home');
}

function updateSidebarActiveState(text) {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent === text) {
            link.classList.add('active');
        }
    });
}

async function analyzeSymptoms() {
    const symptoms = document.getElementById('symptomsInput').value;
    const resultDiv = document.getElementById('analysisResult');
    const loading = document.getElementById('loadingIndicator');
    
    if (!symptoms || !symptoms.trim()) {
        alert("Please enter your symptoms before analyzing.");
        return;
    }

    if (resultDiv) resultDiv.style.display = 'none';
    if (loading) loading.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/api/analyze-symptoms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symptoms })
        });
        
        const data = await response.json();
        
        if (loading) loading.style.display = 'none';
        
        if (data.success) {
            document.getElementById('resDisease').textContent = data.disease;
            document.getElementById('resSeverity').textContent = data.severity;
            document.getElementById('resRecommendation').textContent = data.recommendation;
            
            // Set color based on severity
            const severityEl = document.getElementById('resSeverity');
            if (data.severity === 'Mild') severityEl.style.color = '#4CAF50';
            else if (data.severity === 'Moderate') severityEl.style.color = '#FF9800';
            else if (data.severity === 'Critical') severityEl.style.color = '#F44336';
            else severityEl.style.color = 'var(--text-cream)';
            
            
            // Switch to recommendations section to show results
            showSection('recommendations-section', 'Symptom Checker');

            // Update recommendations list
            const recList = document.getElementById('recommendationsList');
            if (recList) {
                recList.innerHTML = `
                    <div style="background: var(--bg-charcoal); padding: 25px; border-radius: 8px; border: 1px solid var(--accent-green); margin-bottom: 15px;">
                        <h4 style="color: var(--accent-gold); margin-bottom: 10px;">${data.disease}</h4>
                        <p style="color: var(--text-cream); margin-bottom: 10px;"><strong>Severity:</strong> ${data.severity}</p>
                        <p style="color: var(--text-muted);">${data.recommendation}</p>
                        <p style="color: #666; font-size: 0.8rem; margin-top: 15px;">Analyzed just now based on: "${symptoms}"</p>
                    </div>
                ` + recList.innerHTML;
                
                // Hide default recommendation text if it exists
                const defaultRec = document.getElementById('defaultRecommendation');
                if (defaultRec) defaultRec.style.display = 'none';
            }

        } else {
            alert(data.message || "An error occurred while analyzing symptoms.");
        }
    } catch (error) {
        console.error("Error analyzing symptoms:", error);
        if (loading) loading.style.display = 'none';
        alert("Failed to connect to the server. Please try again later.");
    }
}

async function findNearbyHelp(query = 'hospitals and clinics') {
    const loading = document.getElementById('locationLoadingIndicator');
    const resultsDiv = document.getElementById('nearbyHelpResults');
    const facilitiesList = document.getElementById('facilitiesList');
    
    // Switch to emergency section if called from somewhere else
    showSection('emergency-section', 'Emergency');

    if (resultsDiv) resultsDiv.style.display = 'none';
    if (loading) loading.style.display = 'block';

    const callBackend = async (lat, lng) => {
        try {
            const response = await fetch('http://localhost:3000/api/nearby-help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lat, lng, query })
            });
            
            const data = await response.json();
            if (loading) loading.style.display = 'none';
            
            if (data.success) {
                if (resultsDiv) resultsDiv.style.display = 'block';
                // Convert markdown-style response or line breaks to HTML
                const formattedHtml = data.facilities.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                facilitiesList.innerHTML = `<p>Results for <strong>${query}</strong> near your location:</p><br>` + formattedHtml;
            } else {
                alert(data.message || "Could not find nearby facilities.");
            }
        } catch (err) {
            console.error("Error fetching nearby help:", err);
            if (loading) loading.style.display = 'none';
            alert("Error connecting to server to find nearby help. Please ensure the backend server is running.");
        }
    };

    const fallbackToIP = async () => {
        try {
            console.log("Falling back to IP-based location...");
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
                await callBackend(ipData.latitude, ipData.longitude);
            } else {
                throw new Error("Invalid IP location data");
            }
        } catch (ipErr) {
            console.error("IP fallback failed:", ipErr);
            if (loading) loading.style.display = 'none';
            alert("Unable to retrieve your location via GPS or IP. Please check your connection.");
        }
    };

    if (!navigator.geolocation) {
        fallbackToIP();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            callBackend(position.coords.latitude, position.coords.longitude);
        }, 
        (error) => {
            console.warn("Geolocation blocked or failed. Using IP fallback:", error);
            fallbackToIP();
        }, 
        { timeout: 7000 }
    );
}
