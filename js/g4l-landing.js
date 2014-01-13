var map, infowindow;

var cities = [
    {lat:41.396385, lng:2.170000,   zoom: 12, name: "Barcelona"},
    {lat:40.416502, lng:-3.703895,  zoom: 11, name: "Madrid"},
    {lat:43.278456, lng:-2.950000,   zoom: 12, name: "Bilbao"},
    {lat:39.57119, lng:2.646634,   zoom: 12, name: "Palma de Mallorca"},
    {lat:39.480726, lng:-0.376282,   zoom: 12, name: "Valencia"}
    ];

(function(){

    var ua = navigator.userAgent;
    if( ((ua.match(/iPhone/i)) || (ua.match(/iPod/i)))&&(ua.match(/CriOS/)) ) {
        $.smartbanner({
            title: 'GymForLess',
            author: 'Gym Services Online, S.L.',
            appStoreLanguage: 'es',
            button: 'VER',
            daysHidden: 0,
            daysReminder: 0,
            icon: "../img/icon-80x80.png"
        });
    }

    document.getElementById("sendBtn").onclick = function(){
        send();
    };

    function initializeMap() {
        changeCity(0);
    }
    google.maps.event.addDomListener(window, 'load', initializeMap);


})();

function annotations(data, textStatus, jqXHR)
{
    if (textStatus == "success")
    {
        infowindow = new google.maps.InfoWindow({content: ''});
        data.forEach(function(gym) {
            if (gym.location.latitude != null && gym.location.longitude != null) {
                var loc = new google.maps.LatLng(gym.location.latitude,gym.location.longitude);
                var image = '../img/annotation.png';
                var marker = new google.maps.Marker({
                    position: loc,
                    map: map,
                    icon: image,
                    title: gym.name
                });

                google.maps.event.addListener(marker, 'click', function() {
                    var photoKey = "../img/placeholder.png";
                    if (gym.photos.length > 0) {
                        photoKey = 'https://s3-eu-west-1.amazonaws.com/g4l-images/' + gym.id + '/' + gym.photos[0].key;
                    }
                    var content = "<div class='callout'><div class='photo-gym'><img src='"+photoKey+"'/></div><div class='content-gym'><div class='gym-name'>"+gym.name+"</div><div class='categories'>"
                    normalizeCategories(gym.categories).forEach(function(c){
                        content += "<div class='category' style='background: " + c.color + " ";
                        content += "url(\"../img/" + c.imageName + "\") no-repeat; ";
                        content += "background-size: 100%'/></div>";
                    });
                    content += "</div></div><div class='price' onclick='showMessage()'><span>" + gym.products[0].price.formatMoney(2, ',', '.') + "€</span></div></div>";
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                });
            }
        });
    }
}

function normalizeCategories(categories) {

    var colors = ["#535D6F", "#6DB776", "#59BDBA", "#C3D379", "#EA3751", "#F2824D", "#C84A5A", "#EE6539"];
    var imageNames = [ "icon_fitness-small@2x.png",
                       "icon_spa-small@2x.png",
                       "icon_pool-small@2x.png",
                       "icon_activities-small@2x.png",
                       "icon_beauty-small@2x.png",
                       "icon_court-small@2x.png",
                       "icon_services-small@2x.png",
                       "icon_food-small@2x.png" ];

    var normalized = [];

    for (var i = 0; i < categories.length; i++)
    {
        var c = categories[i];

        var categoryMustBeIncluded = false;

        if (c.hasOwnProperty("facilities")){
            c.facilities.forEach(function(f) {
                if (f.included == true) {
                    categoryMustBeIncluded = true;
                }
            });
        }

        if (categoryMustBeIncluded) {
            c.color = colors[i];
            c.imageName = imageNames[i];
            normalized.push(c);
        }
    }

    return normalized;
}


Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function send()
{
    var value = document.getElementById("telephoneOrEmail").value;
    if ( validatePhonenumber(value) || validateEmail(value) )
    {
        var url = 'http://gymforless.herokuapp.com/api/landing'
        var request = $.ajax({
            url: url,
            data: value,
            dataType: 'json',
            type: 'POST',
            cache: false,
            complete: function (xhr, status) {
                if (status === 'error') {
                    alert("Lo sentimos, no se ha podido registrar su teléfono/email en nuestros registros. Inténtelo más tarde.")
                }
                else {
                    document.getElementById("telephoneOrEmail").value = '';
                    alert("Le hemos enviado un enlace de descarga directa a " + value + " ¡Corre a descargar la app!");

                }
            }
        });

    }
    else
    {
        alert("Tiene que ingresar un número móvil o un correo electrónico")
    }
}


function validatePhonenumber(inputtxt)
{
    var phoneno = /^\d{9}/;
    var firstCharacter = inputtxt.charAt(0);
    if( inputtxt.match(phoneno) && (firstCharacter == "6" || firstCharacter == "7"))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function validateEmail(email)
{
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function changeCity(cityIndex) {

    if (infowindow!=null)
        infowindow.close();

    var lng = cities[cityIndex].lng;
    var lat = cities[cityIndex].lat
    var url = 'http://gymforless.herokuapp.com/api/gyms?longitude='+lng+'&latitude='+lat;
    $.ajax({
        url: url,
        type: 'GET',
        success: annotations
    });

    var mapOptions = {
      center: new google.maps.LatLng(lat,lng),
      zoom: cities[cityIndex].zoom,
      streetViewControl: false
    };

    if (map == null)
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    else
    {
        map.setOptions(mapOptions);
        $("#city-name").html(cities[cityIndex].name);
    }

}

function showMessage() {
    alert("Déjanos tu email/teléfono para enviarte un link de descarga y así podrás comprar este cupón");
}