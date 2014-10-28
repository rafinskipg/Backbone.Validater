describe("Custom error messages", function() {


  describe("Apply custom error messages", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phone': 'integerPositive'
        },
        integerPositive: function(val){
          if(!isNaN(val) && _.isNumber(val) && val * 1 > 0){
            return true;
          }else{
            return 'A custom messageeeee';
          }
        }
      });

      validator = new CustomValidator({
        model: myObj
      });

    });

    it('should apply the alias name as the error', function(){
      myObj.set('phone', '-2');
      var issues = validator.validate();
      expect(issues[0].field).toBe('phone');
      expect(issues[0].validation).toBe('A custom messageeeee');
    });

  });

});