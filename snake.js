/**
* Javascript Snake
* Author: Alrex Consus
*/

function Snake() {
	this.block_size = 15; //square
	this.block_len = 15;	//no of blocks
	this.block_step = this.block_size;
	
	this.block_id_cntr = 1;	//block id counter
	this.block_cntr = 0;	//block counter
	this.blocks = new Array();	//block stack
	
	this.turn_pt_cntr = 0;
	this.turn_pts = new Array();
	
	this.curr_dir = 'r';
	this.curr_coor = [ this.block_size, 200 ];
	
	this.timeout = null;
	this.pause = true;
	
	this.move_cntr = 0;
	
	this.speed = 50;
	
	this.block_len_orig = this.block_len;
	
	this.setupBlocks = function() {
		this.preloadBGs();
		
		var start_x = Math.floor( this.curr_coor[0] / this.block_size ) * this.block_size;
		var start_y = Math.floor( this.curr_coor[1] / this.block_size ) * this.block_size;
		var obj;
		
		for( var x=0; x<this.block_len; x++ ) {
			obj = getObj( this.createBlock() );
			
			obj.style.width = this.block_size + 'px';
			obj.style.height = this.block_size + 'px';
			obj.style.top = start_y + 'px';
			obj.style.left = start_x + 'px';
			
			obj.style.backgroundColor = this.getRandomColor();
			
			//setting background image
			if ( x == 0 ) {
				obj.className = 'block tail_' + this.curr_dir;
			}
			
			if ( x == ( this.block_len - 1 ) ) {
				obj.className = 'block head_' + this.curr_dir;
			}
			
			switch( this.curr_dir ) {
				case 't' :
					start_y -= this.block_step;
				break;
				
				case 'b':
					start_y += this.block_step;
				break;
				
				case 'l':
					start_x -= this.block_step;
				break;
				
				default: //r
					start_x += this.block_step;
				break;
			}
			
			this.blocks[ this.block_cntr ] = [ obj, this.curr_dir ];
			this.block_cntr++;
		}
	}
	
	this.createBlock = function() {
		var repository = getObj( 'block_repository' );
		var obj = document.createElement( 'DIV' );
		var new_id = 'block_' + this.block_id_cntr;
		
		obj.className = 'block';
		obj.id = new_id;
		
		repository.appendChild( obj );
		
		this.block_id_cntr++;
		
		return new_id;
	}
	
	this.move = function() {
		var obj;
		var dir;
		var x,y;
		var new_dir;
		
		var head = this.getHeadBlock();
		
		//getObj( 'head' ).innerHTML = 'current head position = x:' + head[0].offsetLeft + ' , y:' + head[0].offsetTop;
		
		//RULE: move the head first
		for( var i=( this.block_cntr - 1 ); i>=0; i-- ) {
			obj = this.blocks[i][0];
			
			this.lookupTurnPoints( i );
			
			dir = this.blocks[i][1];
			
			//to give the snake a disco color... haha
			//obj.style.backgroundColor = this.getRandomColor();
			
			//changing background image
			if ( i == 0 ) {
				obj.className = 'block tail_' + dir;
			}
			
			if ( i == ( this.block_cntr - 1 ) ) {
				obj.className = 'block head_' + dir;
			}
			
			switch( dir ) {
				case 't' :
					x = obj.offsetLeft;
					y = ( obj.offsetTop - this.block_step );
				break;
				
				case 'b':
					x = obj.offsetLeft;
					y = ( obj.offsetTop + this.block_step );
				break;
				
				case 'l':
					x = ( obj.offsetLeft - this.block_step );
					y = obj.offsetTop;
				break;
				
				default: //r
					x = ( obj.offsetLeft + this.block_step );
					y = obj.offsetTop;
				break;
			}
			
			if ( i == ( this.block_cntr - 1 ) ) {
				if ( this.bumped( dir, { "x":x, "y":y } ) ) { 
					this.toggleState();
					this.showMessage();
					return;
				}
				
				if ( this.bumpFood( { "x":x, "y":y } ) ) {
					this.appendBlock();
					i++;
					this.manufactureFood();
				}
			}
			
			obj.style.left = x + 'px';
			obj.style.top = y + 'px';
		}
		
		this.move_cntr++;
		
		//getObj( 'move' ).innerHTML = 'Move counter: ' + this.move_cntr;
		
		this.cleanupTurnPoints();
		
		var self = this;
		
		this.timeout = setTimeout( function(){self.move();}, this.speed );
	}
	
	this.appendBlock = function() {
		var obj = this.food[0];
		var tmp_blocks = new Array();
		var tmp_block_cntr = 1;
		
		var cur_tail = this.getTailBlock();
		
		obj.className = 'block tail_' + cur_tail[1];
		
		switch( cur_tail[1] ) {
			case 't' :
				x = cur_tail[0].offsetLeft;
				y = ( cur_tail[0].offsetTop + this.block_step );
			break;
			
			case 'b':
				x = cur_tail[0].offsetLeft;
				y = ( cur_tail[0].offsetTop - this.block_step );
			break;
			
			case 'l':
				x = ( cur_tail[0].offsetLeft + this.block_step );
				y = cur_tail[0].offsetTop;
			break;
			
			default: //r
				x = ( cur_tail[0].offsetLeft - this.block_step );
				y = cur_tail[0].offsetTop;
			break;
		}
		
		obj.style.left = x + 'px';
		obj.style.top = y + 'px';
		
		tmp_blocks[0] = [ obj, cur_tail[1] ];
		
		this.blocks[0][0].className = 'block';
		this.blocks[0][0].style.backgroundColor = this.getRandomColor();
		
		for( var x=0; x<this.blocks.length; x++ ) {
			tmp_blocks[tmp_block_cntr] = this.blocks[x];
			tmp_block_cntr++;
		}
		
		this.blocks = tmp_blocks;
		this.block_cntr = tmp_block_cntr;
		this.block_len++;
	}
	
	this.getHeadBlock = function() {
		return this.blocks[ ( this.block_cntr - 1 ) ];
	}
	
	this.getTailBlock = function() {
		return this.blocks[0];
	}
	
	this.registerTurnPoint = function( dir, coor ) {
		var head = this.getHeadBlock();
		var x = head[0].offsetLeft;
		var y = head[0].offsetTop;
		
		var coor = {"x":x,"y":y};
		
		this.turn_pts[ this.turn_pt_cntr ] = [ dir, coor, 0 ];
		this.turn_pt_cntr++;
		
		this.curr_dir = dir;
		this.curr_coor = [ coor.x, coor.y ];
		
		//getObj( 'turn' ).innerHTML = 'current turn point = x:' + x + ' , y:' + y;
	}
	
	this.check_tp = false;
	this.lookupTurnPoints = function( block_no ) {
		var blk = this.blocks[block_no][0];
			
		for( var x=0; x<this.turn_pt_cntr; x++ ) {
			
			//getObj( 'compare' ).innerHTML = 'Comparison = (tpoint)' + this.turn_pts[x][1].x + ':' + this.turn_pts[x][1].y + ' - (blck)' + blk.offsetLeft + ':' + blk.offsetTop;
			
			if ( ( blk.offsetLeft == this.turn_pts[x][1].x ) && ( blk.offsetTop == this.turn_pts[x][1].y ) ) {
		
				this.blocks[block_no][1] = this.turn_pts[x][0];
				this.turn_pts[x][2]++;
				
				break;
			}
		}
	}
	
	this.cleanupTurnPoints = function() {
		var tmp_turn_points = new Array();
		var tmp_turn_pt_cntr = 0;
		for( var x=0; x<this.turn_pt_cntr; x++ ) {
			if ( this.turn_pts[x][2] < this.block_len ) {
				tmp_turn_points[ tmp_turn_pt_cntr ] = this.turn_pts[x];
				tmp_turn_pt_cntr++;
			}
		}
		
		this.turn_pts = tmp_turn_points;
		this.turn_pt_cntr = tmp_turn_pt_cntr;
	}
	
	this.firstmove = true;
	
	this.toggleState = function() {
		if ( ! this.pause ) {
			clearTimeout( this.timeout );
			this.pause = true;
			getObj( 'button' ).innerHTML = 'Resume';
		} else {
			this.pause = false;
			
			if ( this.firstmove ) {
				this.manufactureFood();
				this.firstmove = false;
			}
            
            getObj( 'note' ).style.display = 'none';
			
			this.move();
			getObj( 'button' ).innerHTML = 'Pause';
		}
	}
	
	this.bumped = function( dir, coor ) {
		var docdim = getDocDim();
		var obj;
		
		switch( dir ) {
			case 't':
				if ( coor.y <= 0 ) return true;
			break;
			
			case 'b':
				if ( coor.y >= (docdim.height - this.block_size) ) return true;
			break;
			
			case 'l':
				if ( coor.x <= 0 ) return true;
			break;
			
			default: //r
				if ( coor.x >= (docdim.width - this.block_size) ) return true;
			break;
		}
		
		for( var x=0; x<this.block_cntr; x++ ) {
			obj = this.blocks[x][0];
			
			if ( ( coor.x == obj.offsetLeft ) && ( coor.y == obj.offsetTop ) ) return true;
		}
		
		return false;
	}
	
	this.bumpFood = function( coor ) {
		var food_coor = this.food[1];
		
		var top_x = food_coor.x;
		var top_y = food_coor.y;
		var bottom_x = food_coor.x + this.block_step;
		var bottom_y = food_coor.y + this.block_step;
		
		//getObj( 'food' ).innerHTML = 'bump food = x:' + obj.offsetLeft + ' , y:' + obj.offsetTop + ' | x:' + coor.x + ', y:' + coor.y;
		
		if ( ( coor.x == food_coor.x ) && ( coor.y == food_coor.y ) ) { 
			this.check_tp = true; 
			return true; 
		}
		
		return false;
	}
	
	this.food = [];
	this.manufactureFood = function() {
		var obj = getObj( this.createBlock() );
		var docdim = getDocDim();
		var margin = ( this.block_step * 8 );
		var limit_y = docdim.height - margin;
		var limit_x = docdim.width - margin;
		
		obj.style.width = this.block_size + 'px';
		obj.style.height = this.block_size + 'px';
		obj.style.backgroundColor = '#000000';
		
		var x = new Array(), y = new Array();
		
		for( var i=0; i<this.blocks.length; i++ ) {
			x[i] = this.blocks[i][0].offsetLeft;
			y[i] = this.blocks[i][0].offsetTop;
		}
		
		var rx = 0, ry = 0;
		var urx = false, ury = false;
		
		var k=0, random = 0;
		while( ! urx ) {
			if (k > 10) {
				alert('shit');
				break;
			}
			
			random = Math.random();
			
			rx = Math.floor( random * limit_x );
			
			urx = true;
			
			for( i=0; i<x.length; i++ ) {
				if ( x[i] == rx ) {
					urx = false;
					break;
				}
			}
			
			if ( rx < margin ) urx = false;
			
			k++;
		}
		
		k=0;
		while( ! ury ) {
			if (k > 10) {
				alert('shit');
				break;
			}
			
			random = Math.random();
			
			ry = Math.floor( random * limit_y );
			
			ury = true;
			
			for( i=0; i<y.length; i++ ) {
				if ( y[i] == ry ) {
					ury = false;
					break;
				}
			}
			
			if ( ry < margin ) ury = false;
			
			k++;
		}
		
		rx = Math.floor( rx / this.block_step ) * this.block_step;
		ry = Math.floor( ry / this.block_step ) * this.block_step;
		
		obj.style.top = ry + 'px';
		obj.style.left = rx + 'px';
		
		this.food = [ obj, { "x":rx, "y":ry } ];
	}
	
	this.getKeyPressed = function( e ) {
		var char = e.charCode ? e.charCode : e.keyCode;
		
		switch( char ) {
			//top
			case 87: //letter key
			case 38: //arrow key
				if (this.pause) return;
				
				if ( this.curr_dir == "t" || this.curr_dir == "b" ) return;
				this.registerTurnPoint( "t" );
			break;
			
			//bottom
			case 83: //letter key
			case 40: //arrow key
				if (this.pause) return;
				
				if ( this.curr_dir == "b" || this.curr_dir == "t" ) return;
				this.registerTurnPoint( "b" );
			break;
			
			//left
			case 65: //letter key
			case 37: //arrow key
				if (this.pause) return;
				
				if ( this.curr_dir == "l" || this.curr_dir == "r" ) return;
				this.registerTurnPoint( "l" );
			break;
			
			//right
			case 68: //letter key
			case 39: //arrow key
			//default:
				if (this.pause) {
					this.toggleState();
				} else {
					if ( this.curr_dir == "r" || this.curr_dir == "l" ) return;
					this.registerTurnPoint( "r" );
				}
			break;
		}
	}
	
	this.preloadBGs = function() {
		var img1 = new Image();
		img1.src = 'images/head_t.jpg';
		
		var img2 = new Image();
		img2.src = 'images/head_b.jpg';
		
		var img3 = new Image();
		img3.src = 'images/head_l.jpg';
		
		var img4 = new Image();
		img4.src = 'images/head_r.jpg';
		
		var img5 = new Image();
		img5.src = 'images/tail_t.jpg';
		
		var img6 = new Image();
		img6.src = 'images/tail_b.jpg';
		
		var img7 = new Image();
		img7.src = 'images/tail_l.jpg';
		
		var img8 = new Image();
		img8.src = 'images/tail_r.jpg';
	}
	
	this.prev_color = '';
	
	this.getRandomColor = function() {
		//var colors = ['#FF0066','#FFCC33','#9966CC','#FF6600','#66FFFF','#0066FF','#99CC00','#333333','#666600'];
		var colors = ['#E60207','#2DAC3D','#FFCC33','#333333']; //rasta colors
		//var colors = ['#2DAC3D','#FFCC33','#333333'];
		//var colors = ['#333333'];
		
		var rnum = Math.floor( Math.random() * colors.length );
		
		//ensuring that there is no color repeated successively
		while( colors[rnum] == this.prev_color ) {
			rnum = Math.floor( Math.random() * colors.length );
		}
		
		this.prev_color = colors[rnum];
		
		return colors[rnum];
	}
	
	this.showMessage = function() {
		var docdim = getDocDim();
		var mobj = getObj( 'message' );
		
		mobj.style.display = 'inline';
		mobj.style.top = ( docdim.height / 2 ) - ( mobj.offsetHeight / 2 ) + 'px';
		mobj.style.left = ( docdim.width / 2 ) - ( mobj.offsetWidth / 2 ) + 'px';
		
		
		getObj( 'button' ).style.display = 'none';
	}
	
	this.reset = function() {
		for( var x=0; x<this.blocks.length; x++ ) {
			getObj( 'block_repository' ).removeChild( this.blocks[x][0] );
		}
		
		getObj( 'block_repository' ).innerHTML = '';
		
		this.block_id_cntr = 1;	//block id counter
		this.block_cntr = 0;	//block counter
		this.blocks = new Array();	//block stack
		this.block_len= this.block_len_orig;
		
		this.turn_pt_cntr = 0;
		this.turn_pts = new Array();
		
		this.curr_dir = 'r';
		this.curr_coor = [ this.block_size, 200 ];
		
		this.firstmove = true;
		this.pause = true;
		
		this.move_cntr = 0;
		
		this.setupBlocks();
		
		getObj( 'message' ).style.display = 'none';
		getObj( 'button' ).style.display = 'inline';
		getObj( 'button' ).innerHTML = '';
        getObj( 'note' ).style.display = 'block';
	}
	
	this.setupBlocks();
}




function getObj( id ){
	if ( document.all ) {
		return document.all[id];
	}
	
	return document.getElementById( id );
}

function getDocDim() {
	var dim = {};
	
	dim.width = Math.max(
        Math.max( document.body.scrollWidth, document.documentElement.scrollWidth ),
        Math.max( document.body.offsetWidth, document.documentElement.offsetWidth ),
        Math.max( document.body.clientWidth, document.documentElement.clientWidth )
    );
	
   	dim.height = Math.max(
        Math.max( document.body.scrollHeight, document.documentElement.scrollHeight ),
        Math.max( document.body.offsetHeight, document.documentElement.offsetHeight ),
        Math.max( document.body.clientHeight, document.documentElement.clientHeight )
    );
	
	return dim;
}

function getObjPosition( obj ) { 
	var left = 0; 
	var top  = 0; 
		 
	while( obj.offsetParent ) { 
		left += obj.offsetLeft; 
		top += obj.offsetTop; 
		obj = obj.offsetParent; 
	} 
		
	left += obj.offsetLeft; 
	top += obj.offsetTop; 
	
	//alert("x: "+left+", y: "+top);
	return { "x":left, "y":top }; 
}