function toggleEvalFormModal(state) {
    evalFormModal.style.display = state ? 'block' : 'none';
    document.body.style.overflow = state ? 'hidden' : 'auto';
}

function updateTitle() {
    audioTitle.innerHTML = `Audio Sample ${index} of ${maxIndex}`;
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
    for (var i = 2; i <= numQuestions; i++) {
        var radioButtons = document.getElementsByName('q' + i);
        var radioButtonChecked = false;
        for (var x = 0; x < radioButtons.length; x++) {
            if (radioButtons[x].checked) {
                radioButtonChecked = true;
                break;
            }
        }
        if (!radioButtonChecked || q1Input.value.trim() === '') {
            alert('Please answer all questions before proceeding.');
            return false;
        }
    }
    return true;
}

