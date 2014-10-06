describe("Filtering", function() {


  describe("Array filtering", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phones{number="1234"}': 'validateWhenNumberIs'
        },
        validateWhenNumberIs: function(val){
          if(val == '1234'){
            return false;
          }else{
            return true;
          }
        }
      });

      validator = new CustomValidator({
        model: myObj
      });

    });

    it('should extract filters from field', function(){
      var filters = validator.getFiltersFromField('fieldAlias:fieldName{filterOne="valueFilter"&filterTwo="valueFilter2"}');
      expect(filters.length).toBe(2);
      expect(filters[0].field).toBe('filterOne');
      expect(filters[1].field).toBe('filterTwo');
      expect(filters[0].value).toBe('valueFilter');
      expect(filters[1].value).toBe('valueFilter2');
    });

    it('should extract filter string from field string', function(){
      var fieldsString = validator.removeFiltersStringFromField('fieldName{filterOne="valueFilter"&filterTwo="valueFilter2"}');
      expect(fieldsString).toBe('fieldName');
    });

    it('should have the filters on the condition returned', function(){
      var conditions = validator.extractConditionsFromBindings.call(validator);
      expect(conditions.length).toBe(1);
      expect(conditions[0].filters).toExist;
    });

    it('should not trigger the validation if the field is not present', function(){
      myObj.set('phones', [{
        number: '12345'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });
    


    it('should trigger the validation if the field is  present', function(){
      myObj.set('phones', [{
        number: '1234'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

    it('should receive only the filtered values as parameter on the function', function(){
      myObj.set('phones', [{
        number: '1234'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(phones){

        expect(phones.length).toBe(1);
        expect(phones[0].number).toBe('1234');
      });
     
      validator.validate();
    });

  });

});