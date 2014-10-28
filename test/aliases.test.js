describe("Validator condition aliases", function() {


  describe("Apply alias to result", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phoneHasToBeInteger:phone': 'integerPositive',
          'age': 'integerPositive'
        },
        integerPositive: function(val){
          return !isNaN(val) && _.isNumber(val) && val > 0;
        }
      });

      validator = new CustomValidator({
        model: myObj
      });

    });

    it('should apply the validator function', function(){
      myObj.set('phone', '-1');
      myObj.set('age', 'a');
      var issues = validator.validate();
      expect(issues.length).toBe(2);
    });
    
    it('should apply the alias name as the error', function(){
      myObj.set('phone', '-1');
      myObj.set('age', 'a');
      var issues = validator.validate();
      expect(issues[0].field).toBe('phoneHasToBeInteger');
      expect(issues[0].validation).toBe('integerPositive');
    });

  });

});