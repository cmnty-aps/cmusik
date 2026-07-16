// ============================================================
// BACKGROUND AUDIO MANAGER
// ============================================================
// Handles continuous background music playback, audio optimization,
// and persistent playback when the app goes to background

const BgAudioConfig={
    storageKey:'xmusic_bg_config',
    defaults:{
        bgEnabled:true,
        screenOffPlayback:true,
        qualityMode:'balanced',
        dataUsageMode:'normal'
    },
    load(){
        try{
            return JSON.parse(localStorage.getItem(this.storageKey))||this.defaults;
        }catch(e){
            return this.defaults;
        }
    },
    save(config){
        try{
            localStorage.setItem(this.storageKey,JSON.stringify(config));
        }catch(e){}
    }
};

const BackgroundAudioService={
    config:BgAudioConfig.load(),
    
    init(){
        console.log('[v0] BackgroundAudioService initialized');
        this.setupEventListeners();
        this.setupWakeLock();
    },
    
    setupEventListeners(){
        // Monitor visibility changes
        document.addEventListener('visibilitychange',()=>{
            if(document.hidden){
                console.log('[v0] App hidden - background mode active');
                this.onAppBackground();
            }else{
                console.log('[v0] App visible - foreground mode active');
                this.onAppForeground();
            }
        });
        
        // Monitor page hide for PWA context
        window.addEventListener('pagehide',()=>{
            console.log('[v0] Page hide - preserving audio state');
            this.preserveAudioState();
        });
    },
    
    setupWakeLock(){
        if('wakeLock' in navigator){
            console.log('[v0] Wake Lock API available');
        }
    },
    
    async requestWakeLock(){
        if(!('wakeLock' in navigator))return;
        try{
            const lock=await navigator.wakeLock.request('screen');
            console.log('[v0] Wake lock acquired');
            lock.addEventListener('release',()=>{
                console.log('[v0] Wake lock released');
            });
            return lock;
        }catch(e){
            console.log('[v0] Wake lock failed:',e.message);
        }
    },
    
    async releaseWakeLock(){
        // Wake locks are automatically released when needed
    },
    
    onAppBackground(){
        if(!this.config.bgEnabled)return;
        
        if(S&&S.ip){
            console.log('[v0] Audio playing - activating background playback');
            this.activateBackgroundPlayback();
        }
    },
    
    onAppForeground(){
        console.log('[v0] App returned to foreground');
        // Allow YouTube player to resume normal operation
    },
    
    activateBackgroundPlayback(){
        // Request wake lock to keep device active
        if(this.config.screenOffPlayback){
            this.requestWakeLock();
        }
        
        // Update media session for lock screen controls
        this.updateMediaSession();
    },
    
    preserveAudioState(){
        if(S&&S.ct){
            const state={
                videoId:S.ct.videoId,
                currentTime:S.pt,
                isPlaying:S.ip,
                timestamp:Date.now()
            };
            try{
                sessionStorage.setItem('xmusic_audio_state',JSON.stringify(state));
                console.log('[v0] Audio state preserved');
            }catch(e){}
        }
    },
    
    restoreAudioState(){
        try{
            const state=JSON.parse(sessionStorage.getItem('xmusic_audio_state'));
            if(state&&Date.now()-state.timestamp<60000){
                console.log('[v0] Restoring audio state from',Math.round((Date.now()-state.timestamp)/1000),'seconds ago');
                return state;
            }
        }catch(e){}
        return null;
    },
    
    updateMediaSession(){
        if(!('mediaSession' in navigator)||!S||!S.ct)return;
        
        try{
            navigator.mediaSession.metadata=new MediaMetadata({
                title:S.ct.title,
                artist:S.ct.artist,
                album:'Xmusic - Background',
                artwork:[
                    {src:S.ct.cover,sizes:'96x96',type:'image/jpeg'},
                    {src:S.ct.cover,sizes:'192x192',type:'image/jpeg'},
                    {src:S.ct.cover,sizes:'512x512',type:'image/jpeg'}
                ]
            });
            
            navigator.mediaSession.setActionHandler('play',()=>{if(S.yp)S.yp.playVideo();});
            navigator.mediaSession.setActionHandler('pause',()=>{if(S.yp)S.yp.pauseVideo();});
            navigator.mediaSession.setActionHandler('nexttrack',()=>NX());
            navigator.mediaSession.setActionHandler('previoustrack',()=>PV());
            
            console.log('[v0] Media session updated');
        }catch(e){
            console.log('[v0] Media session error:',e.message);
        }
    },
    
    setConfig(newConfig){
        this.config=Object.assign(this.config,newConfig);
        BgAudioConfig.save(this.config);
        console.log('[v0] Background config updated:',this.config);
    },
    
    getConfig(){
        return Object.assign({},this.config);
    }
};

// Initialize when DOM ready
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
        BackgroundAudioService.init();
    });
}else{
    BackgroundAudioService.init();
}
