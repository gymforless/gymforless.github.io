(function(){
	var ua = navigator.userAgent,
		isMobileWebkit = /WebKit/.test(ua) && /Mobile/.test(ua);

	if (isMobileWebkit) {
		$('html').addClass('mobile');
	}

	$(function(){
		if (isMobileWebkit) {
            $('.context-1').css('background-position', '60% -200px');
            $('.context-2').css('background-position', '48% -320px');
            $('.context-3').css('background-position', '48% -300px');
		} else {
			$.stellar({
                horizontalScrolling: false,
                horizontalOffset: 0,
                verticalOffset: 500
			});
            skrollr.init();
		}

	});

})();