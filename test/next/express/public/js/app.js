(function($) {

    $.get({
        url: '/api/users/me',
        dataType: 'json'
    }).done(function(data) {
        if (data && data.name !== 'anonymous') {
            $('.nav-link-login').attr('href', '/logout').html('Logout');
        }
    });

})(jQuery);
