const e = require("express");

function toggleEvalFormModal(state) {
    evalFormModal.style.display = state ? 'block' : 'none';
    document.body.style.overflow = state ? 'hidden' : 'auto';
}

function updateTitle() {
    audioTitle.innerHTML = `${index} of ${maxIndex}`;
}

function extractDemographicData() {
    var formData = new FormData(document.getElementById('demographic-form'));
    var demographicData = {};
    for (var pair of formData.entries()) {
        demographicData[pair[0]] = pair[1];
    }
    return demographicData;
}

function populateDemographicData() {
    userData.demographicData = extractDemographicData();
}

function validateForm() {
    var allChecked = true;
    for (var i = 2; i <= numQuestions; i++) {
        var radioButtons = document.getElementsByName('q' + i);
        for (var x = 0; x < radioButtons.length; x++) {
            if (radioButtons[x].checked) { 
                document.querySelector('label[for="q' + i + '"]').classList.remove('not-answered');
                allChecked = true;
                break; 
            }
            allChecked = false;
            document.querySelector('label[for="q' + i + '"]').classList.add('not-answered');
        }
    }

    if (q1Input.value.trim() === '') { 
        document.querySelector('label[for="q1"]').classList.add('not-answered');
    } else {
        document.querySelector('label[for="q1"]').classList.remove('not-answered');
    }

    if (!allChecked || q1Input.value.trim() === '') {
        alert('Please answer all questions before proceeding.');
        return false;
    }

    return true;
}

