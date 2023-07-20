import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {

    const config = readBlockConfig(block);
    const formTag = block.firstElementChild;

    const formElement = document.createElement("form");
    formElement.setAttribute('id', 'form');
    formTag.appendChild(formElement)


    const tokenRender = formTag.querySelectorAll('div');
    tokenRender.forEach(element => {
        element.style.display = 'none';
    });

    const jsonData = await logJSONData(config.token);
    const fieldData = jsonData.data.fields;
    createForm(fieldData, formElement);

}


async function logJSONData(configToken) {

    const response = await fetch('https://ms-forms-service-staging.digitalpfizer.com/api/v2/forms', {
        headers: {
            'x-config-token': configToken,
        }
    });
    const jsonData = await response.json();
    const fieldData = jsonData.data.fields;

    console.log(fieldData);
    return jsonData;
}

function createForm(fieldData, formElement) {

    fieldData.forEach(field => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'checkbox':
                const inputWrapper = document.createElement("div");
                inputWrapper.className = field.name;
                formElement.appendChild(inputWrapper);

                const labelEmlement = document.createElement("label");
                labelEmlement.innerText = field.label;
                inputWrapper.appendChild(labelEmlement);

                const inputElement = document.createElement("input");
                inputElement.type = field.type;
                inputElement.name = field.name;
                inputWrapper.appendChild(inputElement);


                if (field.validators.length > 0) {
                    const errorElement = document.createElement("div");
                    inputWrapper.appendChild(errorElement);
                    errorElement.className = "error-message hidden-element";

                    field.validators.forEach(function (validate) {
                        if (validate.type == 'required') {
                            inputElement.setAttribute('required-error', validate.message);
                        } else if (validate.type == 'email') {
                            inputElement.setAttribute('email-error', validate.message);
                        }
                    })
                };


                if (field.value && field.type === 'checkbox') {
                    inputElement.value = field.value;
                }
                break;

            case 'html':
                let htmlText = document.createElement("div");
                htmlText.innerHTML = field.html;
                formElement.appendChild(htmlText);
                break;

            case 'button':
                let submitForm = document.createElement("button");
                submitForm.innerHTML = field.label;
                submitForm.name = field.name;
                submitForm.type = field.type;
                submitForm.addEventListener("click", e => {
                    e.preventDefault();
                    submitFormData();
                })
                formElement.appendChild(submitForm);
                break;

            case 'radio':
                const inputRadios = document.createElement("div");
                formElement.appendChild(inputRadios);

                const labelRadios = document.createElement("label");
                labelRadios.innerText = field.label;
                inputRadios.appendChild(labelRadios);

                const radios = field.options;

                radios.forEach(radio => {

                    const inputRadio = document.createElement("input");
                    inputRadio.type = field.type;
                    inputRadio.value = radio.value;
                    inputRadio.name = field.name;
                    inputRadios.appendChild(inputRadio);

                    const labelRadio = document.createElement("label");
                    labelRadio.innerText = radio.label;
                    inputRadios.appendChild(labelRadio);
                })
                break;
            case 'checkboxes':
                const checkboxesWrapper = document.createElement("div");
                checkboxesWrapper.className = field.name;
                formElement.appendChild(checkboxesWrapper);

                const labelCheckboxes = document.createElement("label");
                labelCheckboxes.innerHTML = field.label;
                checkboxesWrapper.appendChild(labelCheckboxes);

                const checkboxItems = field.options;

                checkboxItems.forEach(checkbox => {
                    const inputCheckbox = document.createElement("input");
                    inputCheckbox.type = "checkbox";
                    inputCheckbox.value = checkbox.value;
                    inputCheckbox.name = field.name;
                    checkboxesWrapper.appendChild(inputCheckbox);

                    const labelCheckbox = document.createElement("label");
                    labelCheckbox.innerHTML = checkbox.label;
                    checkboxesWrapper.appendChild(labelCheckbox);
                })

                break;

        }
    })

}

const checkValidateInput = function (inputElement) {
    let isValid = true;

    const className = inputElement.getAttribute('name');
    const inputWrapper = block.querySelector(`.${className}`);
    const divError = block.querySelector(`.${className} .error-message`);

    if (!inputElement.value) {
        divError.classList.remove('hidden-element');
        divError.innerHTML = inputElement.getAttribute('required-error');
        isValid = false;
    } else {
        divError.classList.add('hidden-element');
    }

    if (inputElement.type == 'email' && isValid == true) {
        const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailReg.test(inputElement.value)) {

            divError.classList.remove('hidden-element');
            console.log('Please enter a valid email address')
            divError.innerHTML = inputElement.getAttribute('email-error');
            isValid = false;
        } else {
            divError.classList.add('hidden-element');

        }
    }

    // if (inputElement.type == 'checkbox' && isValid == true) {
    //     if (!inputElement.checked) {
    //         inputWrapper.classList.add('error-element');
    //         divError.innerHTML = inputElement.getAttribute('required-error');
    //         isValid = false;
    //     } else {
    //         inputWrapper.classList.remove('error-element');
    //     }
    // }

    return isValid;
}

const validateForm = function () {
    let isValid = true;

    const firstName = document.querySelector('input[name="firstName"]');
    const lastName = document.querySelector('input[name="lastName"]');
    const emailVal = document.querySelector('input[name="email"]');
    // const checkbox = document.querySelector('input[name="overEighteen"]');

    if (!checkValidateInput(firstName)) {
        isValid = false;
    }
    if (!checkValidateInput(lastName)) {
        isValid = false;
    }
    if (!checkValidateInput(emailVal)) {
        isValid = false;
    }

    // if (!checkValidateInput(checkbox)) {
    //     isValid = false;
    // }
    return isValid;
};


function submitFormData() {

    // const inValid = validateForm();
    // if (inValid) {

    const firstName = document.querySelector('input[name="firstName"]').value;
    const lastName = document.querySelector('input[name="lastName"]').value;
    const emailVal = document.querySelector('input[name="email"]').value;
    const i_am = document.querySelector('input[name="i_am"]:checked');
    const familiar = document.querySelector('input[name="familiar"]:checked');
    const learning_interest = document.querySelector('input[name="learning_interest"]:checked');
    const topicElements = [...document.getElementsByName('topic')];
    const agreement = document.querySelector('input[name="agreement"]:checked');

    if (i_am) {
        const i_amValue = document.querySelector('input[name="i_am"]:checked').value;
    }

    if (familiar) {
        const familiarValue = document.querySelector('input[name="familiar"]:checked').value;
    }

    if (learning_interest) {
        const learning_interestValue = document.querySelector('input[name="learning_interest"]:checked').value;
    }

    let topicValue = [];
    topicElements.forEach(topic => {
        if (topic.checked) {
            topicValue.push(topic.value);
        }
    })
    topicValue = topicValue.join(", ");


    if (agreement) {
        const agreementValue = document.querySelector('input[name="agreement"]:checked').value;
    }



    // fetch('https://ms-forms-service-staging.digitalpfizer.com/api/v2/forms', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         firstName: firstName,
    //         lastName: lastName,
    //         email: emailVal,
    //         overEighteen: '1',
    //         csrfToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb25maWdUb2tlbiI6ImZvcm1fYnVpbGRlcl9fc3RhZ2luZ19fNjQ2X193ZCIsImlkIjoiMzRkZGRhZWYzMGMwMGI1ZTVjY2NmYmY5NDlkNWU1ZmMiLCJleHAiOjE2ODk2NzE2MTAsImlzcyI6IkRFVCIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJ9.pAxAV792AHjsMWjA7cpTcBw0Gs-1zac7AfoLa7KtwUY",
    //     }),
    //     headers: {
    //         'x-config-token': 'form_builder__staging__646__wd'
    //     }
    // })
    // }


}




