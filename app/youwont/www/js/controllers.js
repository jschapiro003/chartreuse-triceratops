var youwontController = angular.module('youwont.controllers', ['FacebookLogin', 'Challenges', 'ngCordova','youwont.services']);

youwontController.controller('challengeCtrl', function ($scope, challenges,DatabaseService) {
  $scope.challenges = challenges;
  DatabaseService.getUsersChallenges()
});

youwontController.controller('responsesCtrl', function ($scope) {

  $scope.challenge = {
    title: "Mark's challenge",
    responses : []
  };

  (function() {
    for (var i = 0; i < 3; i++) {
      $scope.challenge.responses.push({
        id: i,
        title: "Test title",
        people: "Bob, Peter, Joanne",
        img: "http://placehold.it/50x50",
        description: "Walk to the corner shop naked",
        likes: 3
      });

    }
  })();

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

youwontController.controller('videoCtrl', function ($scope, challenges, $ionicPlatform, $state, $cordovaCamera, $cordovaCapture, VideoService,DatabaseService,authLogin) {
  

  $scope.challenge = {};
  challenges.push($scope.challenge);

  $scope.challenge.clip = '';
  $scope.challenge.status = '';
  $scope.challenge.title = '';
  $scope.challenge.description = '';
  $scope.user = authLogin.ref.getAuth();
  $scope.user = $scope.user.uid

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

});