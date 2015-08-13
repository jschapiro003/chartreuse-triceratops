angular.module('youwont.services', [])
  .service('VideoService', function($q) {

    var deferred = $q.defer();
    var promise = deferred.promise;

    promise.success = function(fn) {
      promise.then(fn);
      return promise;
    }

    promise.error = function(fn) {
      promise.then(null, fn);
      return promise;
    }

    // Resolve the URL to the local file
    // Start the copy process
    function createFileEntry(fileURI) {
      window.resolveLocalFileSystemURL(fileURI, function(entry) {
        return copyFile(entry);
      }, fail);
    }

    // Create a unique name for the videofile
    // Copy the recorded video to the app dir
    function copyFile(fileEntry) {

      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = makeid() + name;

      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
        fileEntry.copyTo(fileSystem2, newName, function(succ) {
          return onCopySuccess(succ);
        }, fail);
      }, fail);

    }

    // Called on successful copy process
    // Creates a thumbnail from the movie
    // The name is the moviename but with .png instead of .mov
    function onCopySuccess(entry) {
      var name = entry.nativeURL.slice(0, -4);
      window.PKVideoThumbnail.createThumbnail(entry.nativeURL, name + '.png', function(prevSucc) {
        return prevImageSuccess(prevSucc);
      }, fail);
    }

    // Called on thumbnail creation success
    // Generates the currect URL to the local moviefile
    // Finally resolves the promies and returns the name
    function prevImageSuccess(succ) {
      var correctUrl = succ.slice(0, -4);
      correctUrl += '.MOV';
      deferred.resolve(correctUrl);
    }

    // Called when anything fails
    // Rejects the promise with an Error
    function fail(error) {
      console.log('FAIL: ' + error.code);
      deferred.reject('ERROR');
    }

    // Function to make a unique filename
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    // The object and functions returned from the Service
    return {
      // This is the initial function we call from our controller
      // Gets the videoData and calls the first service function
      // with the local URL of the video and returns the promise
      saveVideo: function(data) {
        createFileEntry(data[0].localURL);
        return promise;
      }
    }

  })
  .service("DatabaseService", function() {
    var db = {};
    db.ref = new Firebase("https://sayiwont.firebaseio.com/"); 
    db.addNewUser = function(userName, userProfilePicture, facebookID, uid) {
      //Adding new user to our database 
      var ref = new Firebase("https://sayiwont.firebaseio.com/");    
      if (userName && userProfilePicture && facebookID && uid) {     
        ref.child("users").child(uid).set({            
          id: facebookID,
          name: userName,
          profilePicture: userProfilePicture,
          friends: { "Mark Robson" :{id:"10153502325756226",name:"Mark Robson"}}
        });    
      }
    };
    db.addNewChallenge = function(challengeName,challengeDescription,user,vidURL){
      alert(user)
      if (challengeName && challengeDescription && user && vidURL){
        db.ref.child("challenges").child(challengeName).set({
          challengeName:challengeName,
          challengeDescription:challengeDescription,
          user:user,
          video:vidURL,
          responses: {}
        });
      } else {
        console.error('addNewChallenge is missing params')
      }

    };

    db.addResponse = function(challenge,responseVidURL,user){
      if (challenge && responseVidURL && user){
        //add response as property of challenge
      } else {
        console.error('addResponse missing params')
      }
    }

    db.addFriend = function(friend,callback){
        //get user object
        
        var currentUser = db.ref.getAuth().facebook.displayName;
        console.log()
     

        db.ref.child('users').orderByChild('name').equalTo(currentUser).on('child_added',  function(snapshot){ 
        
          if (friend){
           //
           var friendObject = {
            id: friend.id,
            name: friend.name,
            profilePicture: friend.profilePicture
           }
           
           var key = friendObject.id
           console.log(key)
                       
            snapshot.ref().child('friends').push(friendObject)
            
          }
          
        })
    }

    db.getFriends = function(callback){
      var ref = new Firebase("https://sayiwont.firebaseio.com/users")
      var friends = [];
      db.addFriend();
      ref.orderByKey().on("child_added", function(snapshot) {
     
        friends.push(snapshot.val());
        if (callback){
          callback(friends)
        }
      });

      
    }
    return db;
  });
