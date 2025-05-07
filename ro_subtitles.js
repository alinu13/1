(function(){
    let plugin = {};

    plugin.name = 'Subtitrari RO Automate';
    plugin.version = '1.0';

    plugin.run = function(){
        Lampa.Listener.follow('full', (event)=>{
            if(event.type === 'movie' || event.type === 'tv'){
                adaugaSubtitrare(event.data);
            }
        });
    };

    function adaugaSubtitrare(film){
        let titlu = film.original_title || film.name || film.title;
        let url = `https://api.opensubtitles.com/api/v1/subtitles?query=${encodeURIComponent(titlu)}&languages=ro`;

        fetch(url, {
            headers: {
                'Api-Key': 'CYoqs2KyRHhAAQnqLDIj3sc9gS3R37Vg',
                'Content-Type': 'application/json'
            }
        })
        .then(r => r.json())
        .then(data => {
            if(data && data.data && data.data.length){
                let files = data.data[0].attributes.files;
                if (!files || !files.length) return;

                let subtitleId = files[0].file_id;

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
                            label: 'Română',
                            url: sub.link,
                            srclang: 'ro',
                            default: true
                        });
                    }
                });
            }
        });
    }

    Lampa.Plugin.register(plugin);
})();