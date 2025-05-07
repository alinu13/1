(function(){
    let plugin = {};
    let settings = {
        language: 'ro',
        label: 'Română',
        color: '#FFFFFF',
        default: true
    };

    plugin.name = 'Subtitrari Avansate';
    plugin.version = '1.2';

    plugin.run = function(){
        Lampa.Settings.listener.follow('open', function(e){
            if(e.name == 'subtitles_custom'){
                e.body.find('.settings-param').remove(); // curăță vechile opțiuni

                let langs = ['ro', 'en', 'fr', 'es', 'de'];
                langs.forEach(function(lang){
                    e.body.append(Lampa.Settings.param({
                        name: lang,
                        type: 'toggle',
                        default: (lang === settings.language),
                        onchange: function(value){
                            if(value){
                                settings.language = lang;
                                settings.label = lang.toUpperCase();
                                Lampa.Settings.update();
                            }
                        },
                        description: 'Caută subtitrări în: ' + lang.toUpperCase()
                    }));
                });
            }
        });

        Lampa.Settings.add({
            component: 'subtitles_custom',
            name: 'Subtitrări personalizate',
            type: 'custom',
            icon: 'cc'
        });

        Lampa.Listener.follow('full', (event)=>{
            if(event.type === 'movie' || event.type === 'tv'){
                cautaSubtitrare(event.data);
            }
        });
    };

    function cautaSubtitrare(film){
        let titlu = film.original_title || film.name || film.title;
        Lampa.Noty.show('Caut subtitrare în ' + settings.language + ' pentru: ' + titlu);

        let url = `https://api.opensubtitles.com/api/v1/subtitles?query=${encodeURIComponent(titlu)}&languages=${settings.language}`;

        fetch(url, {
            headers: {
                'Api-Key': 'CYoqs2KyRHhAAQnqLDIj3sc9gS3R37Vg',
                'Content-Type': 'application/json'
            }
        })
        .then(r => r.json())
        .then(data => {
            if(data && data.data && data.data.length){
                let best = data.data.find(sub => sub.attributes.files && sub.attributes.files.length > 0);
                if(!best){
                    Lampa.Noty.show('Nu am găsit fișier valid.');
                    return;
                }

                let subtitleId = best.attributes.files[0].file_id;

                fetch(`https://api.opensubtitles.com/api/v1/download`, {
                    method: 'POST',
                    headers: {
                        'Api-Key': 'CYoqs2KyRHhAAQnqLDIj3sc9gS3R37Vg',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ file_id: subtitleId })
                })
                .then(r => r.json())
                .then(sub => {
                    if(sub && sub.link){
                        Lampa.Player.addSubtitle({
                            label: settings.label,
                            url: sub.link,
                            srclang: settings.language,
                            type: 'subtitle',
                            default: settings.default
                        });
                        Lampa.Noty.show('Subtitrare ' + settings.label + ' adăugată!');
                    }
                });
            } else {
                Lampa.Noty.show('Nu am găsit subtitrări în ' + settings.language + '.');
            }
        })
        .catch(e => {
            Lampa.Noty.show('Eroare: ' + e.message);
        });
    }

    Lampa.Plugin.register(plugin);
})();