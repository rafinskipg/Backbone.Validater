describe("Backbone validator", function() {


  it("Should be defined", function() {
    expect(Backbone.validator).toExist;
  });

  describe("Required fields", function(){
    var myObj;
    //Some model using our validator
    var myModel;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new myModelWithValidator({});

    });


    it('should notify the 3 required fields', function(){
      myObj.set('name', '');
      myObj.set('street', '');
      myObj.set('phone', '');
      var issues = myObj.validate();
      expect(issues.length).toBe(3);
    });
    
    it('should not notify fulfilled required fields', function(){
      myObj.set('name', 'Name');
      myObj.set('street', 'Ontario');
      myObj.set('phone', '');
      var issues = myObj.validate();
      expect(issues.length).toBe(1);
    });

  });

  describe("Bindings parser", function(){
    var validator;

    beforeEach(function(){
      validator = new Backbone.validator({});
    });

    it('should extract a simple field', function(){
      validator.validations = {
        'name': 'irrelevant'
      }

      var conditions = validator.extractConditionsFromBindings();

      expect(conditions).toExist;
      expect(conditions.length).toBe(1);
      expect(conditions[0].fields[0]).toBe('name');
    });

    it('should bind the function to the field', function(){
      validator.validations = {
        'name': 'relevant'
      }

      var conditions = validator.extractConditionsFromBindings();

      expect(conditions).toExist;
      expect(conditions.length).toBe(1);
      expect(conditions[0].validation).toBe('relevant');
    });

    it('should extract a complex field condition', function(){
      validator.validations = {
        'name&street': 'irrelevant'
      }

      var conditions = validator.extractConditionsFromBindings();

      expect(conditions).toExist;
      expect(conditions.length).toBe(1);
      expect(conditions[0].fields[0]).toBe('name');
      expect(conditions[0].fields[1]).toBe('street');

    });

    //TODO: Implement OR condition and nested conditions

  });

  describe('Conditions fulfillment', function(){
    var validator;
    var myObj;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});
      validator = new Backbone.validator({
        model: myObj
      });
    });

    it('should not return it if the field is not present', function(){
      validator.validations = {
        'name': 'irrelevant'
      }
      
      myObj.set('name', '');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(0);
    });

    it('should agree if all the fields are present', function(){
      validator.validations = {
        'name': 'irrelevant'
      }

      myObj.set('name', 'eyyyyyyy tronco');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(1);
    });

    it('should be able to have multiple fields fulfilled', function(){
      validator.validations = {
        'name&street&address': 'irrelevant'
      }

      myObj.set('name', 'eyyyyyyy tronco');
      myObj.set('street', 'eyyyyyyy tronco');
      myObj.set('address', 'eyyyyyyy tronco');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(1);
    });

    it('should fail if some of the fields is empty', function(){
      validator.validations = {
        'name&street&address': 'irrelevant'
      }

      myObj.set('name', 'eyyyyyyy tronco');
      myObj.set('street', '');
      myObj.set('address', 'eyyyyyyy tronco');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(0);
    });

    it('should accept a empty field condition', function(){
      validator.validations = {
        'name&!street&address': 'irrelevant'
      }

      myObj.set('name', 'eyyyyyyy tronco');
      myObj.set('street', '');
      myObj.set('address', 'eyyyyyyy tronco');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(1);
    });

    it('multiple conditions', function(){
      validator.validations = {
        'name&!street&address': 'irrelevant',
        '!street': 'irrelevant2',
        'name': 'nameCondition'
      }

      myObj.set('name', 'eyyyyyyy tronco');
      myObj.set('street', '');
      myObj.set('address', 'eyyyyyyy tronco');

      var conditions = validator.getConditionsFulfilled();

      expect(conditions.length).toBe(3);
    });
  });


  describe("Extended validation", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'name': 'nameIsValid',
          'street': 'streetIsValid',
          'phone': 'phoneIsValid'
        },
        nameIsValid: function(){},
        streetIsValid: function(){},
        phoneIsValid: function(){}
      });

      validator = new CustomValidator({
        model: myObj
      });

    });


    it('should not have required fields', function(){
      myObj.set('name', '');
      myObj.set('street', '');
      myObj.set('phone', '');
      var issues = validator.validate();
      expect(issues).toBe(null);
    });
    

    it('should call the validate functions', function(){
      myObj.set('name', 'ey');
      myObj.set('street', 'ey');
      myObj.set('phone', 'ey');

      var nameIsValid = sinon.stub(validator, 'nameIsValid', function(){});
      var streetIsValid = sinon.stub(validator, 'streetIsValid', function(){ });
      var phoneIsValid = sinon.stub(validator, 'phoneIsValid', function(){ });
      
      validator.validate();
      expect(nameIsValid.callCount).toBe(1);
      expect(streetIsValid.callCount).toBe(1);
      expect(phoneIsValid.callCount).toBe(1);
    });

  });


  
  describe("Returning errors", function(){
    var myObj;
    //Some model using our validator
    var validator;

    beforeEach(function(){
      //Create a model with some stuff
      myObj = new Backbone.Model({});

      var CustomValidator = Backbone.validator.extend({
        validations: {
          'name': 'nameIsValid',
          'street': 'streetIsValid',
          'phone': 'phoneIsValid',
          '!angle': 'angleIsNotPresent'
        },
        nameIsValid: function(name){
          if(name == 'default'){
            return false;
          }
          return true;
        },
        streetIsValid: function(street){
          if(street == 'madrid'){
            return false;
          }
          return true;
        },
        phoneIsValid: function(){
          return false;
        },
        angleIsNotPresent: function(){
          return true;
        }
      });

      validator = new CustomValidator({
        model: myObj
      });

    });


    it('should return the list of fields that fail the validation', function(){
      myObj.set('name', 'default');
      myObj.set('street', 'madrid');
      myObj.set('phone', 'aaa');
      var issues = validator.validate();
   
      expect(issues.length).toBe(3);
      expect(issues[0].field).toBe('name');
      expect(issues[0].validation).toBe('nameIsValid');
      expect(issues[1].field).toBe('street');
      expect(issues[1].validation).toBe('streetIsValid');
      expect(issues[2].field).toBe('phone');
      expect(issues[2].validation).toBe('phoneIsValid');
    });

    it('should return null if validates', function(){
      myObj.set('name', 'as');
      myObj.set('street', 'as');
      var issues = validator.validate();
   
      expect(issues).toBe(null);
      
    });
    

  });

  
});