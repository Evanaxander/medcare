document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    document.getElementById('enhancedSearchForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const symptoms = document.getElementById('enhancedSymptomsInput').value;
        const district = document.getElementById('enhancedDistrictSelect').value;
        const language = document.getElementById('enhancedLanguageSelect').value;
        
        if (!symptoms.trim()) {
            alert('Please describe your symptoms');
            return;
        }
        
        if (!district) {
            alert('Please select your district');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Symptoms...
        `;
        
        try {
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms: symptoms,
                    district: district,
                    language: language
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display results
            displayResults(data);
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Find Specialists
            `;
        }
    });
    
    // AI Suggestions button
    document.getElementById('aiSuggestBtn').addEventListener('click', async function() {
        const textarea = document.getElementById('enhancedSymptomsInput');
        if (!textarea.value.trim()) {
            alert('Please describe some symptoms first');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = 'Thinking...';
        
        try {
            // In a real app, you'd call your backend for AI suggestions
            // This is a mock implementation
            const commonPatterns = {
                'headache': 'Are you also experiencing sensitivity to light or sound?',
                'fever': 'Do you have any cough or difficulty breathing with the fever?',
                'stomach pain': 'Is the pain accompanied by nausea or vomiting?'
            };
            
            let suggestion = "Some common related symptoms you might want to mention:";
            for (const [key, value] of Object.entries(commonPatterns)) {
                if (textarea.value.toLowerCase().includes(key)) {
                    suggestion += `\n- ${value}`;
                }
            }
            
            if (suggestion === "Some common related symptoms you might want to mention:") {
                suggestion = "Try to describe: duration, severity, and any other associated symptoms.";
            }
            
            textarea.value += `\n\n${suggestion}`;
        } catch (error) {
            console.error('AI suggestion error:', error);
        } finally {
            this.disabled = false;
            this.innerHTML = 'AI Suggestions';
        }
    });
});

function displayResults(data) {
    // Show results section
    document.getElementById('enhancedResultsSection').classList.remove('hidden');
    
    // Display analysis
    const analysisDiv = document.getElementById('enhancedAnalysisResult');
    analysisDiv.innerHTML = `
        <p class="text-gray-700 mb-2"><strong>Likely Specialization:</strong> ${data.specialization}</p>
        <p class="text-gray-700">${data.analysis}</p>
    `;
    
    // Display doctors
    const doctorsList = document.getElementById('enhancedDoctorsList');
    doctorsList.innerHTML = '';
    
    if (data.doctors.length === 0) {
        doctorsList.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p class="text-yellow-700">No doctors found matching your criteria. Try expanding your search area.</p>
            </div>
        `;
        return;
    }
    
    data.doctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-blue-50';
        doctorCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-xl font-semibold text-gray-800">👨‍⚕️ ${doctor.name}</h4>
                    <p class="text-blue-600 font-medium">🏥 ${doctor.specialization}</p>
                    <p class="text-gray-600">📍 ${doctor.hospital}, ${doctor.district}</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center space-x-1 mb-1">
                        <span class="text-yellow-400">⭐</span>
                        <span class="font-semibold">${doctor.rating || '4.0'}</span>
                    </div>
                    <p class="text-sm text-gray-500">📅 ${doctor.experience || '10+ years'}</p>
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
                ${doctor.languages ? doctor.languages.split(',').map(lang => `
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🗣️ ${lang.trim()}</span>
                `).join('') : ''}
            </div>
            <div class="flex flex-wrap gap-3">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    📅 Book Appointment
                </button>
                <button class="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors">
                    📞 Call: ${doctor.phone || 'Not available'}
                </button>
                <button class="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors">
                    👤 View Profile
                </button>
            </div>
        `;
        doctorsList.appendChild(doctorCard);
    });
    
    // Smooth scroll to results
    document.getElementById('enhancedResultsSection').scrollIntoView({
        behavior: 'smooth'
    });
}