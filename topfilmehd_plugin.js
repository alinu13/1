(function(){
    let plugin = {};

    plugin.name = 'TopFilmeHD';
    plugin.version = '1.0';

    plugin.run = function(){
        Lampa.Platform.addSource({
            name: 'TopFilmeHD',
            types: ['movie'],
            onRequest: function(params, callback){
                let titlu = (params.title || '').toLowerCase();

                if(titlu.includes('midway')){
                    callback([{
                        title: 'Midway (Subtitled, HD)',
                        file: 'https://vidhidepro.com/v/gm7pvg16z34k',
                        quality: 'HD',
                        voice: 'Subtitrat',
                        info: 'TopFilmeHD',
                        player: true
                    }]);
                } else {
                    callback([]);
                }
            }
        });
    };

    Lampa.Plugin.register(plugin);
})();