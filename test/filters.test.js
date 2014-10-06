describe("Filtering", function() {
  describe('Array filter', function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      validator = new Backbone.validator({
        model: myObj
      });

      myObj.set('goals', [
        {
          name: 'pepe',
          budget: 'daily',
          target: '0.9'
        },
        {
          name: 'papo',
          budget: 'fairy'
        }
      ]);
    });


    it('should return the values filtered from a list', function(){
      var valuesFiltered = validator.getFilteredValuesFromField({
        name: 'goals',
        filters: [
          {
            field: 'name',
            value: 'pepe'
          },
          {
            field: 'budget',
            value: 'daily'
          }
        ]
      });

      expect(valuesFiltered.length).toBe(1);
    });
  });

  describe("Condition array filtering", function(){
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
      var filters = validator.getFiltersFromField('fieldName{filterOne="valueFilter"&filterTwo="valueFilter2"}');
      expect(filters.length).toBe(2);
      expect(filters[0].field).toBe('filterOne');
      expect(filters[1].field).toBe('filterTwo');
      expect(filters[0].value).toBe('valueFilter');
      expect(filters[1].value).toBe('valueFilter2'); 

      var filters2 = validator.getFiltersFromField('phones{number="1234"&name="pepe"}');
      expect(filters2.length).toBe(2);
      expect(filters2[0].field).toBe('number');
      expect(filters2[1].field).toBe('name');
      expect(filters2[0].value).toBe('1234');
      expect(filters2[1].value).toBe('pepe');
    });

    it('should extract filter string from field string', function(){
      var fieldsString = validator.removeFiltersStringFromField('fieldName{filterOne="valueFilter"&filterTwo="valueFilter2"}');
      expect(fieldsString).toBe('fieldName');
    });

    it('should have the filters on the condition returned', function(){
      var conditions = validator.extractConditionsFromBindings();
      expect(conditions.length).toBe(1);
      expect(conditions[0].fields).toBeDefined();
      expect(conditions[0].fields[0].name).toBe('phones');
      
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
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

  });


  describe("Various filters on one field", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phones{number="1234"&name="pepe"}': 'validateWhenNumberAndName'
        },
        validateWhenNumberAndName: function(val){
         
        }
      });

      validator = new CustomValidator({
        model: myObj
      });
    });
     


    it('should not trigger the validation if the field is not present', function(){
      myObj.set('phones', [{
        number: '1234',
        name: 'papo'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });
    


    it('should trigger the validation if the field is  present', function(){
      myObj.set('phones', [{
        number: '1234',
        name: 'pepe'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

    it('should receive only the filtered values as parameter on the function', function(){
      myObj.set('phones', [{
        number: '1234',
        name: 'pepe'
      },{
        number: '1233'
      }]);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(phones){
        expect(phones.length).toBe(1);
        expect(phones[0].number).toBe('1234');
        expect(phones[0].name).toBe('pepe');
      });
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

  });

});