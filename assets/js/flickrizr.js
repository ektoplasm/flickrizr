/*!
 * jQuery.Flickrizr
 * Copyright (c) 2016 Junior Herval - http://www.ekto.com.br/
 * Licensed under MIT.
 * Date: 7/15/2016
 *
 * @project Responsive and simple Flickr gallery
 * @author Junior Herval
 * @version 1.0
 *
 * @id jQuery.flickrizr
 * @param {jQuery, String} caller Object to place the gallery
 * @param {String} gallery Gallery ID or full URL
 * @param {Object} settings Hash of settings.
 *
 * @id jQuery.fn.flickrizr
 * @param {String} gallery Gallery ID or full URL
 * @param {Object} settings Hash of settings.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @example :
 *	$.flickrizr('#gallery', 'https://www.flickr.com/photos/library_of_congress/albums/72157608675448396', {
 *		language: 'en-US'
 *	});
 *
 * @example :
 *	$('#gallery').flickrizr('72157608675448396', {
 *		language: 'en-US'
 *	});
 */
"use strict";
(function($){

    var $flickrizr;
    var holder;
    var options;
    var limit;
    var loadedImages = 0;
    var gallerySize = 0;

    $flickrizr = $.flickrizr = function(caller, gallery, opt) {
        options = $.extend( {}, $flickrizr.defaults, opt );
        options.prevIcon = options.basePath + '/assets/images/prev.png';
        options.nextIcon = options.basePath + '/assets/images/next.png';

        holder = $(caller);

        var regExpUrl = /(\d+){17,}/g;
        var galleryMatch = regExpUrl.exec(gallery);

        console.log(galleryMatch);

        if(galleryMatch == null) {
            holder.html($flickrizr.messages[options.language].notFound);
        } else {
            holder.html($('<p>', {
                'class': 'flickrizr-loading'
            }));

            $flickrizr.updateLoading();

            $.getJSON(options.basePath + '/flickrizr.php', { set: galleryMatch[0] }).done(function(data){

                holder.html($flickrizr.generateHtml(data));
            });
        }

        return this;
    };

    $flickrizr.updateLoading = function() {
        var msg = $flickrizr.messages[options.language].loading;
        $('.flickrizr-loading').html(msg);
    };

    $flickrizr.generateHtml = function(data) {

        loadedImages = 0;

        limit = data.size;
        var $div = $('<div class="flickrizr-gallery">');
        var $thumbsWrapper = $('<div class="flickrizr-thumbs-wrapper">');

        $thumbsWrapper.append($('<a>', {
            href: 'javascript:void(0)',
            'class': 'flickrizr-thumb-nav-prev',
            'data-jcarousel-control' : true,
            'data-target': '-=1'
        }).html('<img src="' + options.prevIcon + '">'));

        var $divCarouselWrapper = $('<div>', {
            'class': 'flickrizr-thumbs',
            'data-jcarousel': true,
            'data-wrap': 'last'
        });

        var $ulThumbs = $('<ul>');
        gallerySize = data.size;

        for(var i = 0; i < gallerySize; i++) {
            var item = data.photos[i];
            var $li = $('<li>');

            $.get(item.srcbig);

            var $a = $('<a>', {
                href: item.url,
                'data-caption': (i+1) + ' / '+ gallerySize+': ' + item.title,
                'data-medium': item.src,
                'data-big': item.srcbig,
                'data-position': i
            }).click($flickrizr.clickPicture);

            $a.append($('<img>', {
                src: item.thumb,
                alt: item.title,
                title: item.title
            }));

            $li.append($a).appendTo($ulThumbs);
        }

        $divCarouselWrapper.append($ulThumbs);
        $thumbsWrapper.append($divCarouselWrapper).append($('<a>', {
            href: 'javascript:void(0)',
            'class': 'flickrizr-thumb-nav-next',
            "data-jcarousel-control" : true,
            'data-target': '+=1'
        }).html('<img src="' + options.nextIcon + '">'));

        $div.append($thumbsWrapper);

        var $imageWrapper = $('<div>', {
            'class' : 'flickrizr-full-image'
        }).html('<div class="image"/>');

        $div.append($imageWrapper);

        var $captionWrapper = $('<div>', {
            'class': 'flickrizr-caption'
        }).hide();

        $div.append($captionWrapper);

        $imageWrapper.append($('<a>', {
            href: 'javascript:void(0)',
            'class': 'flickrizr-nav-prev'
        }).click(function(){
            var $pos = parseInt($('.flickrizr-full-image .image img').data('position') - 1);
            if($pos < 0)
                $pos = 0;

            $('.flickrizr-thumbs a').eq($pos).trigger('click');
        }).html('<img src="' + options.prevIcon + '">'))
            .append($('<a>', {
                href: 'javascript:void(0)',
                'class': 'flickrizr-nav-next'
            }).click(function(){
                var $pos = parseInt($('.flickrizr-full-image .image img').data('position') + 1);
                if($pos > limit)
                    $pos = limit;

                $('.flickrizr-thumbs a').eq($pos).trigger('click');
            }).html('<img src="' + options.nextIcon + '">'));


        holder.html($div);

        $('[data-jcarousel]').each(function() {
            var el = $(this);
            el.jcarousel(el.data());
        });

        $.each($('[data-jcarousel-control]'), function(i,o) {
            var el = $(o);
            el.jcarouselControl(el.data());
        });

        $('.flickrizr-thumbs a').eq(0).trigger('click');

    };

    $flickrizr.clickPicture = function(e,o) {
        e.preventDefault();

        var $this = o || $(this);

        var $a = $('<a>', {
            target: 'blank',
            href: $this.attr('href')
        });

        $('<img>', {
            src: $this.data('big'),
            alt: $this.data('caption'),
            title: $this.data('caption'),
            'data-position': $this.data('position')
        }).appendTo($a);

        $('.flickrizr-full-image .image')
            .addClass('flickrizr-loading-black')
            .html($a);

        $('.flickrizr-caption')
            .toggle(($(this).data('caption') != ''))
            .html($(this).data('caption'));
    };

    $flickrizr.defaults = {
        basePath : 'assets/js/flickrizr',
        language: 'pt-BR',
        preload: true,
        showList: true
    };

    $flickrizr.messages = {
        'pt-BR' : {
            notFound: 'Galeria n\u00E3o encontrada.',
            loading: 'Carregando galeria...'
        },
        'en-US' : {
            notFound: 'Gallery not found.',
            loading: 'Loading photoset...'
        }
    };

    $.fn.flickrizr = function(gallery, options) {
        $.flickrizr(this, gallery, options);
    }

})(jQuery);