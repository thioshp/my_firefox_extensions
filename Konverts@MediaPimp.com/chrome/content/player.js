if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.Player = {
	m_szCurrentURL			: "",
	m_pMediaPlayer			: null,
	m_pVLCPlayer			: null,
	m_nVolume				: 50,
	m_nMuteVolume			: 0,
	m_szPlayerType			: "vlc",
	
	CreateCore: function() {
		try {
			switch(this.m_szPlayerType) {
				case "vlc":
					this.m_pVLCPlayer = document.getElementById('vidbar-vlc');
					this.m_pMediaPlayer = null;
					break;
				default:
					this.m_pVLCPlayer = null;
					this.m_pMediaPlayer = document.getElementById('vidbar-wmpPlugin');
					break;
			}
		}
		catch(e) {
			alert(e.message);
			this.m_pMediaPlayer = null;
			this.m_pVLCPlayer = null;
			return false;
		};
		
		return true;		
	},

	Play: function() {
		try {
		if (this.m_szCurrentURL) {
			switch(this.m_szPlayerType) {
				case "vlc":
					if (this.m_pMediaPlayer)
						this.m_pMediaPlayer.controls.stop();
					if (!this.m_pVLCPlayer)
						this.CreateCore();
					if (this.m_pVLCPlayer) {
			    		this.m_pVLCPlayer.playlist.playItem(this.m_pVLCPlayer.playlist.add(this.m_szCurrentURL, this.m_szCurrentURL, ""));	
		        		this.m_pVLCPlayer.audio.volume = parseInt(this.m_nVolume);
					}
					break;
				default:
					if (this.m_pVLCPlayer)
			 			this.m_pVLCPlayer.playlist.stop();	
					if (!this.m_pMediaPlayer)
						this.CreateCore();
					if (this.m_pMediaPlayer) {
						this.m_pMediaPlayer.URL = this.m_szCurrentURL;
						this.m_pMediaPlayer.settings.volume = this.m_nVolume;
						this.m_pMediaPlayer.controls.play();
					}
					break;
			}
		}
		} catch(e) {alert('Play exception: ' + e.message);};
	},

 	Stop: function() {
 		if (this.m_pMediaPlayer)
 			this.m_pMediaPlayer.controls.stop();
 			
		if (this.m_pVLCPlayer)
 			this.m_pVLCPlayer.playlist.stop();	
	},
	
 	Pause: function() {
 		if (this.m_pMediaPlayer)
 			this.m_pMediaPlayer.controls.pause();	

		if (this.m_pVLCPlayer)
 			this.m_pVLCPlayer.playlist.togglePause();	
	},
	
	Mute: function() {
		if (this.m_nMuteVolume > 0) {
			this.m_nVolume = this.m_nMuteVolume;
			this.m_nMuteVolume = 0; 
		} else {
			this.m_nMuteVolume = this.m_nVolume;
			this.m_nVolume = 0; 
		}

 		if (this.m_pMediaPlayer)
 			this.m_pMediaPlayer.settings.volume = parseInt(this.m_nVolume);
 		if (this.m_pVLCPlayer)
       		this.m_pVLCPlayer.audio.volume = parseInt(this.m_nVolume);
		
	},
	
	SetStation: function(station) {
		this.m_szCurrentURL = station.replace(/~!!~/g, "\\\\");
	},
	
	SetVolume: function(volume) {
		try {
			this.m_nVolume = volume;
			this.m_nMuteVolume = 0;
	
	 		if (this.m_pMediaPlayer)
	 			this.m_pMediaPlayer.settings.volume = parseInt(this.m_nVolume);
	 			
	 		if (this.m_pVLCPlayer)
	       		this.m_pVLCPlayer.audio.volume = parseInt(this.m_nVolume);
		} 
		catch(e) {
			alert('SetVolume exception: ' + e.message);
		}
	},
	
	GetWMPState : function(stateId) {
		switch(stateId) {
			case 0:  return "undefined"; break;
			case 1:  return "stopped"; break;
			case 2:  return "paused"; break;
			case 3:  return "playing"; break;
			case 6:  return "buffering"; break;
			case 7:  return "waiting"; break;
			case 8:  return "ended"; break;
			case 9:  return "preparing new item"; break;
			case 10: return "ready"; break;
			case 11: return "reconnecting"; break;
		}
	},
	
	GetVLCState : function(stateId) {
		switch(stateId) {
			case 0:  return "waiting"; break;
			case 1:  return "opening"; break;
			case 2:  return "buffering"; break;
			case 3:  return "playing"; break;
			case 4:  return "paused"; break;
			case 5:  return "stopped"; break;
			case 6:  return "ended"; break;
			case 7:  return "error"; break;
		}
	},
		
	GetPlayState: function() {
		switch(this.m_szPlayerType) {
			case "vlc":
				return (this.m_pVLCPlayer ? this.GetVLCState(this.m_pVLCPlayer.input.state) : "stopped")
				break;
			default:
				return (this.m_pMediaPlayer ? this.GetWMPState(this.m_pMediaPlayer.playState) : "stopped")
				break;
		}
	},
	
	GetDuration: function() {
		switch(this.m_szPlayerType) {
			case "vlc":
				return (this.m_pVLCPlayer ? this.m_pVLCPlayer.input.length / 1000 : 0);
				break;
			default:
				return (this.m_pMediaPlayer ? this.m_pMediaPlayer.currentMedia.duration : 0);
				break;
		}
	},
	
	GetPosition: function() {
		switch(this.m_szPlayerType) {
			case "vlc":
				return (this.m_pVLCPlayer ? this.m_pVLCPlayer.input.time / 1000 : 0);
				break;
			default:
				return (this.m_pMediaPlayer ? this.m_pMediaPlayer.controls.currentPosition : 0);
				break;
		}
	},
	
	SetPosition: function(position) {
		switch(this.m_szPlayerType) {
			case "vlc":
				if (this.m_pVLCPlayer)
					this.m_pVLCPlayer.input.time = position * 1000;
				break;
			default:
				if (this.m_pMediaPlayer)
					this.m_pMediaPlayer.controls.currentPosition = parseInt(position);
				break;
		}
	},
}