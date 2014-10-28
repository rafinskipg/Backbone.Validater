describe("Nested field filters", function() {
  describe('Nested field filters', function(){
    var myObj;
    //Some model using our validator
    var validator, validation1,validation2,validation3,validation4;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'targeting{temperature.min="1234"}': 'validateWhenNumberIs',
          'targeting{temperature.max&temperature.min}': 'validateWhenTemperatureMaxandMinArePresent',
          'targeting{temperature.max="1234"&temperature.min}': 'validateWhenTemperatureMaxIsValueAndMinIsPresent',
          'targeting{temperature.max&!temperature.min}': 'validateWhenTemperatureMaxIsPresentAndTemperatureMinIsNot'
        },
        validateWhenNumberIs: function(val){},
        validateWhenTemperatureMaxandMinArePresent: function(val){},
        validateWhenTemperatureMaxIsValueAndMinIsPresent: function(val){},
        validateWhenTemperatureMaxIsPresentAndTemperatureMinIsNot: function(val){}
      });

      validator = new CustomValidator({
        model: myObj
      });

      validation1 = sinon.stub(validator, 'validateWhenNumberIs', function(){});
      validation2 = sinon.stub(validator, 'validateWhenTemperatureMaxandMinArePresent', function(){});
      validation3 = sinon.stub(validator, 'validateWhenTemperatureMaxIsValueAndMinIsPresent', function(){});
      validation4 = sinon.stub(validator, 'validateWhenTemperatureMaxIsPresentAndTemperatureMinIsNot', function(){});
     
    });

    it('should find the fields in the condition', function(){
      var filters = validator.getFiltersFromField('fieldName{filterOne.nestedField="valueFilter"}');
      expect(filters.length).toBe(1);
      expect(filters[0].name).toBe('filterOne');
      expect(filters[0].value).toBe('valueFilter');
      expect(filters[0].nested.name).toBe('nestedField');
    });

    it('should satisfy condition', function(){
       myObj.set('targeting', {
        temperature: {
          min: '1234',
          max: ''
        }
      });
       
      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(1);

    });

    it('should trigger the validation 1 if the condition mets', function(){
       myObj.set('targeting', {
        temperature: {
          min: '1234',
          max: ''
        }
      });

      validator.validate();
      expect(validation1.callCount).toBe(1);
      expect(validation2.callCount).toBe(0);
      expect(validation3.callCount).toBe(0);
      expect(validation4.callCount).toBe(0);
    });

    it('should trigger the validation 2 if the condition mets', function(){
       myObj.set('targeting', {
        temperature: {
          min: '1234',
          max: '32'
        }
      });
      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(2);

      validator.validate();
      expect(validation1.callCount).toBe(1);
      expect(validation2.callCount).toBe(1);
      expect(validation3.callCount).toBe(0);
      expect(validation4.callCount).toBe(0);


    });    

    it('should trigger the validation 3 if the condition mets', function(){
       myObj.set('targeting', {
        temperature: {
          min: 'AS',
          max: '1234'
        }
      });

      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(2);

      validator.validate();
      expect(validation1.callCount).toBe(0);
      expect(validation2.callCount).toBe(1);
      expect(validation3.callCount).toBe(1);
      expect(validation4.callCount).toBe(0);

    });


    it('should trigger the validation 4 if the condition mets', function(){
       myObj.set('targeting', {
        temperature: {
          min: '',
          max: '1234'
        }
      });

      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(1);

      validator.validate();
      expect(validation1.callCount).toBe(0);
      expect(validation2.callCount).toBe(0);
      expect(validation3.callCount).toBe(0);
      expect(validation4.callCount).toBe(1);

    });
    it('should not trigger the validation if the condition mets', function(){

    });
   
  });

});