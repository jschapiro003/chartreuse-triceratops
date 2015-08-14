var youwontController = angular.module('youwont.controllers', ['FacebookLogin', 'Challenges', 'ngCordova','youwont.services']);

youwontController.controller('challengeCtrl', function ($scope, challenges) {
  $scope.challenges = challenges;
});

youwontController.controller('responsesCtrl', function ($scope, challenges) {
  $scope.challenges = challenges;
});

youwontController.controller('responseCtrl', function ($scope, $stateParams, challenges) {
  $scope.challenge = null;
  angular.forEach(challenges, function (value, key) {
    if ($stateParams.id === value.id) {
      $scope.challenge = value;
    }
  });
});

youwontController.controller('loginCtrl', function ($scope,authLogin) {
    $scope.logout = authLogin.logout;
    $scope.getAuthState = authLogin.checkState;
    $scope.login = authLogin.logUserIn;
});

youwontController.controller('friendsCtrl', function ($scope,authLogin,DatabaseService) {
    DatabaseService.getFriends(function(friends){
      $scope.friends = friends;
    });
   $scope.addFriend = DatabaseService.addFriend;
});

youwontController.controller('videoCtrl', function ($scope, challenges, $ionicPlatform, $state, $cordovaCamera, $cordovaCapture, VideoService, DatabaseService, authLogin) {

  $scope.challenge = {};
  reset();

  //helper function to reset challenges
  function reset() {
    $scope.challenge.clip = null;
    $scope.challenge.id = null;
    $scope.challenge.status = '';
    $scope.challenge.uid = authLogin.ref.getAuth().uid;
    $scope.challenge.img = '';
    $scope.challenge.title = '';
    $scope.challenge.description = '';
  }

  function createId(clipUrl) {
    return clipUrl.substr(clipUrl.lastIndexOf('/') + 1).slice(0, -4);
  }

  $scope.captureVideo = function() {

    var options = { 
      limit: 3, 
      duration: 15
    };

    $ionicPlatform.ready(function() { //wrapper to ensure device is ready
      $cordovaCapture
        .captureVideo(options).then(function(videoData) {
            VideoService.saveVideo(videoData)
            .success(function(data) {
                $scope.challenge.clip = data;
                $scope.challenge.status = data;
                $scope.challenge.id = createId(data);
                $scope.challenge.img = $scope.generateThumb(data);
                $scope.$apply();
              }).error(function(data) {
                $scope.challenge.status = data;
              });
          }, function(err) {
            $scope.challenge.status = err.message;
          });
    }); //wrapper

  };

  $scope.generateThumb = function(clipUrl) {
    var name = clipUrl.substr(clipUrl.lastIndexOf('/') + 1);
    var trueOrigin = cordova.file.dataDirectory + name;
    var sliced = trueOrigin.slice(0, -4);
    return sliced + '.png';
  }

  $scope.testChallenge = function(){
    //console.log('title: ' + $scope.challenge.title);
    var title = $scope.challenge.title;
    var description = $scope.challenge.description;
    var user = $scope.user;
    console.log('usr: ' + user)
    //console.log('description: ' + $scope.challenge.description)
    DatabaseService.addNewChallenge(title,description,user);
  }

  $scope.save = function () {
    if ($scope.challenge.img && !!$scope.challenge.clip) {
      challenges.push(angular.copy($scope.challenge));
      //need to add clip, id, img, id, title, description
      //DatabaseService.addNewChallenge(title,description,user);
      //reset previous
      reset();
    } //else notify user
  };

});