describe("Filtering objects", function() {
  describe('Object filter', function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      validator = new Backbone.validator({
        model: myObj
      });

      myObj.set('name', 'nameOfObj');

      myObj.set('party', {
        music: 'fandango',
        ages: {
          min: '',
          max: ''
        },
        temperature: {
          min: 1,
          max: 50
        }
      });
    });


    it('should return the value if it matches the filters', function(){
      var valuesFiltered = validator.getFilteredValuesFromField({
        name: 'party',
        filters: [
          {
            field: 'music',
            value: 'fandango'
          }
        ]
      });

      expect(valuesFiltered).toBeDefined();
      expect(valuesFiltered.music).toBe('fandango');
    });

    it('should return null if it does not match the filters', function(){
      var valuesFiltered = validator.getFilteredValuesFromField({
        name: 'party',
        filters: [
          {
            field: 'music',
            value: 'sardina'
          }
        ]
      });

      expect(valuesFiltered).toBe(null);
    });

    it('should return the field if the value is not indicated, when its fullfiled', function(){
      var valuesFiltered = validator.getFilteredValuesFromField({
        name: 'party',
        filters: [
          {
            field: 'music'
          }
        ]
      });

      expect(valuesFiltered).toBeDefined();
      expect(valuesFiltered.music).toBe('fandango');
    });

    it('should return empty if the value is not indicated and the subfield is not present', function(){
      var valuesFiltered = validator.getFilteredValuesFromField({
        name: 'party',
        filters: [
          {
            field: 'pepino'
          }
        ]
      });

      expect(valuesFiltered).toBe(null);
    });
  });

  describe("Condition object filtering", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phone{number="1234"}': 'validateWhenNumberIs'
        },
        validateWhenNumberIs: function(val){
        
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

      var filters2 = validator.getFiltersFromField('phones{number&name="pepe"}');
      expect(filters2.length).toBe(2);
      expect(filters2[0].field).toBe('number');
      expect(filters2[1].field).toBe('name');
      expect(filters2[0].value).not.toBeDefined();
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
      expect(conditions[0].fields[0].name).toBe('phone');
      
    });

    it('should not trigger the validation if the field is not present', function(){
      myObj.set('phone', {
        number: '12345'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });
    


    it('should trigger the validation if the field is  present', function(){
      myObj.set('phone', {
        number: '1234'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

    it('should receive only the filtered values as parameter on the function', function(){
      myObj.set('phone', {
        number: '1234'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberIs', function(phone){
        expect(phone.number).toBe('1234');
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
          'phone{number="1234"&name="pepe"}': 'validateWhenNumberAndName'
        },
        validateWhenNumberAndName: function(val){
         
        }
      });

      validator = new CustomValidator({
        model: myObj
      });
    });
     


    it('should not trigger the validation if the field is not present', function(){
      myObj.set('phone', {
        number: '1234',
        name: 'papo'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });
    


    it('should trigger the validation if the field is  present', function(){
      myObj.set('phone', {
        number: '1234',
        name: 'pepe'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

    it('should receive only the filtered values as parameter on the function', function(){
      myObj.set('phone', {
        number: '1234',
        name: 'pepe'
      });

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(phone){
        expect(phone.number).toBe('1234');
        expect(phone.name).toBe('pepe');
      });
     
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

  });

  describe("Without specifying a value, filter if it is fulfilled", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'phone{number&name}': 'validateWhenNumberAndName'
        },
        validateWhenNumberAndName: function(val){
         
        }
      });

      validator = new CustomValidator({
        model: myObj
      });
    });

    it('should not trigger the validation if the field is not present', function(){
      myObj.set('phone', {
        number: '1234'
      });

      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(0);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });

    it('should trigger the validation if the field is present ', function(){
      myObj.set('phone', {
        number: '1234',
        name: 'pepe'
      });

      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(1);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(1);
    });

    it('should not trigger the validation if the field is present but empty', function(){
      myObj.set('phone', {
        number: '',
        name: 'pepe'
      });
      var conditionsFulfilled = validator.getConditionsFulfilled();
      expect(conditionsFulfilled.length).toBe(0);

      var phoneValidatorFunction = sinon.stub(validator, 'validateWhenNumberAndName', function(){});
      validator.validate();
      expect(phoneValidatorFunction.callCount).toBe(0);
    });
    
  });

});