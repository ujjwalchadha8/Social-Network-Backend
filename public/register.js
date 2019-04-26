$(() => {

    $('#regForm').submit((event) => {
        event.preventDefault();
        let formData = {}
        formData.email = $("#email").val();
        formData.password = $("#password").val()
        formData.confirmPassword = $("#confirmPassword").val()
        formData.gender = $('input[name=gender]:checked').val();
        formData.state = $("#state").val();
        formData.country = $("#country").val();
        formData.city = $("#city").val();
        formData.address = $("#address").val();

        let formValidation = validateFormData(formData);
        if (!formValidation[0]) {
            $("#regError").text(formValidation[1])
        } else {
            $("#regError").text("")
            delete formData.confirmPassword
            formData.gender = formData.gender === 'male' ? 0 : 1
            submitProfile(formData)
        }
        return false
    })

    $('loginForm').submit((event) => {
        event.preventDefault();
        let formData = {}
        formData.email = $("#loginEmail").val();
        formData.password = $("#loginPassword").val()
        $.ajax({
            url: "localhost:4000/login",
            method: "POST",
            data: formData,
        }).done((result) => {
            window.location.href = "/profile.html"
        }).fail((err) => {
            $("#loginError").text("Cannot proceed with your request at the moment. Try again later.")
            console.error(err);
        });
    })

    function validateFormData(formData) {
        if (!formData.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            return [false, 'Invalid email']
        }
        if (!formData.password.match(/.*[A-Z].*/)) {
            return [ false, 'There must be atleast 1 uppercase character in password'];
        }
        if (!formData.password.match(/\d/)) {
            return [ false, 'There must be atleast 1 digit in password'];
        }
        if (!formData.password.match(/[^A-Za-z0-9]/)) {
            return [ false, 'There must be atleast 1 special character in password'];
        }
        if (formData.password !== formData.confirmPassword) {
            return [ false, 'The 2 passwords must match'];
        }
        return [true]
    }
    
    function submitProfile(profile) {
        console.log('SUBMITTING profile', profile);
        $.ajax({
            url: "localhost:4000/register",
            method: "POST",
            data: profile,
        }).done((result) => {
            console.log('SUCCESS');
            $("#loginModal").modal('show');
        }).fail((err) => {
            $("#regError").text("Cannot proceed with your request at the moment. Try again later.")
            console.error(err);
        });
    }

})