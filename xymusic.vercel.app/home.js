const Home={
    render(){
        gid('view-home').innerHTML=`
        <div class="glass-pane border-b border-white/5 pt-12 pb-6 px-6 sticky top-0 z-10">
            <div class="flex justify-between items-center">
                <div><h1 class="text-3xl font-black text-white">Xmusic</h1><p class="text-neutral-400 text-xs mt-1 font-medium tracking-wide uppercase">Dengarkan musik terbaik</p></div>
                <button onclick="Home.refresh()" class="glass glass-hover rounded-full p-3 text-white active:scale-90"><i data-lucide="refresh-cw" class="w-4 h-4"></i></button>
            </div>
        </div>
        <div class="px-6 space-y-8 mt-6 pb-24">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">Rekomendasi</h2>
                    <button onclick="Home.shuffleRec()" class="text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all font-medium"><i data-lucide="shuffle" class="w-3 h-3"></i> Acak</button>
                </div>
                <div id="home-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
            </div>
            <div>
                <h2 class="text-xl font-bold mb-4 text-white">Trending Hits</h2>
                <div id="home-scroll" class="flex gap-5 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    cleanTitle(t){
        return t.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    },
    shuffleRec(){
        if(S.rec && S.rec.length>0){
            var i=Math.floor(Math.random()*S.rec.length);
            PK('home_rec',i);
        }
    },
    async fetch(){
        try{
            var r=await fetch('/api/home');
            var d=await r.json();
            if(d.status){
                S.rec=d.result.recommendations || [];
                S.trend=d.result.trending || [];
                Home.show();
            }
        }catch(e){}
    },
    show(){
        var g=gid('home-grid'),s=gid('home-scroll');if(!g||!s)return;
        g.innerHTML=(S.rec||[]).slice(0,20).map((t,i)=>`<div onclick="PK('home_rec',${i})" class="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-3 cursor-pointer transition-all duration-300 active:scale-95 animate-stagger" style="animation-delay:${(i*50)}ms"><img src="${t.cover}" class="w-14 h-14 rounded-xl object-cover shadow-xl mb-3" onerror="this.src='${FI}'" /><span class="font-bold text-sm text-white line-clamp-2">${es(this.cleanTitle(t.title))}</span><span class="text-xs text-neutral-400 mt-1 block">${t.duration}</span></div>`).join('');
        s.innerHTML=(S.trend||[]).map((t,i)=>`<div onclick="PK('home_trend',${i})" class="flex-shrink-0 w-32 sm:w-40 cursor-pointer group animate-stagger" style="animation-delay:${((i+6)*50)}ms"><div class="w-32 h-32 sm:w-40 sm:h-40 mb-3 relative rounded-2xl overflow-hidden shadow-2xl"><img src="${t.cover}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='${FI}'" /><div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div><div class="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-2 group-hover:translate-y-0"><i data-lucide="play" class="w-5 h-5 fill-current text-white"></i></div></div><h3 class="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">${es(this.cleanTitle(t.title))}</h3><p class="text-neutral-400 text-xs truncate mt-1">${es(t.artist)} • ${t.duration}</p></div>`).join('');
        lucide.createIcons();
    },
    refresh(){Home.fetch();gid('main-area').scrollTop=0;}
};

