const Search={
    render(){
        gid('view-search').innerHTML=`
        <div class="pt-12 px-4"><h1 class="text-3xl font-black mb-4">Cari</h1><form id="search-form" class="relative" autocomplete="off"><div class="absolute inset-y-0 left-0 pl-4 flex items-center text-[#6b7280]"><i data-lucide="search" class="h-5 w-5"></i></div><input type="text" id="search-input" class="w-full glass-input text-white font-medium rounded-xl pl-12 pr-16 py-3.5 focus:outline-none placeholder:text-[#6b7280]" placeholder="Cari lagu, artis, atau album..." autocomplete="off" /><button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 btn-chrome font-bold px-4 py-1.5 rounded-lg active:scale-90">Cari</button></form><div id="suggestions" class="hidden mt-2 glass-strong rounded-xl shadow-2xl max-h-72 overflow-y-auto hide-scrollbar"></div></div>
        <div id="filter-tabs" class="hidden flex gap-2 px-4 pb-3 mt-3"><button onclick="setFilter('all')" id="f-all" class="filter-tab active px-4 py-2 rounded-full text-sm font-medium bg-white text-black">Semua</button><button onclick="setFilter('songs')" id="f-songs" class="filter-tab glass px-4 py-2 rounded-full text-sm font-medium text-white">Lagu</button><button onclick="setFilter('videos')" id="f-videos" class="filter-tab glass px-4 py-2 rounded-full text-sm font-medium text-white">Video</button><button onclick="setFilter('artists')" id="f-artists" class="filter-tab glass px-4 py-2 rounded-full text-sm font-medium text-white">Artis</button></div>
        <div class="px-4 mt-2" id="search-results"></div>`;
        lucide.createIcons();Search.events();
    },
    events(){
        var sf=gid('search-form'),si=gid('search-input');if(!sf||!si)return;
        sf.addEventListener('submit',async function(e){
            e.preventDefault();S.sq=si.value.trim();
            var sg=gid('suggestions');if(sg)sg.classList.add('hidden');
            if(!S.sq){S.ar=[];S.sr=[];S.artists=[];Search.show();return;}
            var url=location.origin+'/?search='+encodeURIComponent(S.sq);
            history.pushState({},'',url);
            Search.show(true);
            try{
                var r=await fetch(API.search+'?query='+encodeURIComponent(S.sq));
                var d=await r.json();
                S.ar=d.status&&d.result.songs?d.result.songs.map(function(s){
                    return{id:s.videoId,videoId:s.videoId,title:cn(s.title),artist:cn(s.artist),artistId:s.artistId||'',cover:s.cover||s.thumbnail||FI,ytUrl:s.url};
                }):[];
                S.artists=d.status&&d.result.artists?d.result.artists:[];
                var ft=gid('filter-tabs');if(ft)ft.classList.remove('hidden');
                Search.apply();
            }catch(e){S.ar=[];S.artists=[];Search.show();}
        });
        si.addEventListener('input',function(){var q=this.value.trim();if(!q){var sg=gid('suggestions');if(sg)sg.classList.add('hidden');return;}fetch(API.suggest+'?q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(s){var sg=gid('suggestions');if(!sg)return;if(Array.isArray(s)&&s.length>0){sg.innerHTML=s.map(function(sg){return'<div onclick="selectSuggestion(\''+es(sg).replace(/'/g,"\\'")+'\')" class="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm">'+es(sg)+'</div>';}).join('');sg.classList.remove('hidden');}else{sg.classList.add('hidden');}});});
        document.addEventListener('click',function(e){if(!e.target.closest('#search-form')&&!e.target.closest('#suggestions')){var sg=gid('suggestions');if(sg)sg.classList.add('hidden');}});
    },
    show(loading){
        var c=gid('search-results');if(!c)return;if(!S.sq){c.innerHTML='';return;}
        if(loading){c.innerHTML='<div class="text-center mt-10"><div class="w-8 h-8 border-3 border-[#cfd3d8] border-t-transparent rounded-full animate-spin mx-auto"></div></div>';return;}
        
        var html = '';
        
        // Show Artists if filter is all or artists
        if((S.filter==='all' || S.filter==='artists') && S.artists.length > 0){
            html += '<div class="mb-6"><h2 class="text-lg font-bold mb-3">Artis</h2><div class="flex gap-4 overflow-x-auto hide-scrollbar pb-2">';
            S.artists.forEach(function(a){
                html += '<div onclick="Artist.open(\''+a.id+'\',\''+es(a.name).replace(/'/g,"\\'")+'\')" class="flex-shrink-0 text-center cursor-pointer group w-24">';
                html += '<div class="w-24 h-24 rounded-full overflow-hidden glass-edge mb-2"><img src="'+a.thumbnail+'" class="w-full h-full object-cover group-hover:scale-110 transition-transform" onerror="this.src=\''+FI+'\'" /></div>';
                html += '<p class="text-xs font-medium truncate group-hover:text-[#cfd3d8]">'+es(a.name)+'</p></div>';
            });
            html += '</div></div>';
        }
        
        if(S.filter !== 'artists'){
            if(S.sr.length===0){
                if(S.filter!=='all') html += '<p class="text-center text-[#6b7280] mt-10">Tidak ada hasil</p>';
            } else {
                if(S.filter==='all') html += '<h2 class="text-lg font-bold mb-3">Lagu</h2>';
                html += S.sr.map(function(t,i){
                    return'<div onclick="PK(\'search\','+i+')" class="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer active:scale-[0.98] animate-stagger" style="animation-delay:'+(i*30)+'ms"><img src="'+t.cover+'" class="w-12 h-12 rounded-lg object-cover shadow-md" onerror="this.src=\''+FI+'\'" /><div class="truncate"><h3 class="font-medium truncate '+(S.ct&&S.ct.id===t.id?'text-[#cfd3d8]':'text-white')+'">'+es(t.title)+'</h3><p class="text-[#6b7280] text-sm truncate">'+es(t.artist)+'</p></div></div>';
                }).join('');
            }
        }
        
        c.innerHTML = html;
    },
    apply(){if(S.filter==='all')S.sr=S.ar;else if(S.filter==='songs'||S.filter==='videos')S.sr=S.ar;else S.sr=[];Search.show();}
};
function selectSuggestion(t){gid('suggestions').classList.add('hidden');gid('search-input').value=t;gid('search-form').dispatchEvent(new Event('submit'));}
function setFilter(f){S.filter=f;document.querySelectorAll('.filter-tab').forEach(function(el){el.classList.remove('active','bg-white','text-black');el.classList.add('glass','text-white');});var a=gid('f-'+f);if(a){a.classList.add('active','bg-white','text-black');a.classList.remove('glass','text-white');}Search.apply();}