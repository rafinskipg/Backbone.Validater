(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery', '_', 'Backbone'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.jQuery, root._, root.Backbone);
    }
}(this, function ($, _, Backbone) {
    
    /**
     Backbone validator 0.0.1 
    */
    var BackboneValidator = Backbone.View.extend({
      validations: {

      },
      hasContent : function (objectToCheck){

        if(_.isBoolean(objectToCheck)){
          return true;
        }

        if(_.isArray(objectToCheck) && objectToCheck.length > 0){
          return true;
        }

        //Object with keys
        if(!_.isArray(objectToCheck) && _.keys(objectToCheck).length > 0){
          var keys = _.keys(objectToCheck);
          for(var i = 0; i < keys.length; i++){
            if(this.hasContent(objectToCheck[keys[i]])){
              return true;
            }
          }
          return false;
        }

        if(_.isFinite(objectToCheck) || !_.isEmpty(objectToCheck)){
          return true;
        }

        //Null, '', undefined, [], {}
        return false;
      },

      checkRequiredFields: function(){
        var obj = this.model.toJSON();
        var fails = [];

        for(var n in this.model.requiredFields) {
          var propName = this.model.requiredFields[n];
          if(!this.hasContent(obj[propName])){
            fails.push({
              field: propName,
              validation: 'required'
            });
          }
        }
        return fails.length > 0 ? fails : null;
      },
      customValidations: function(){
        var conditionsFulfilled = this.getConditionsFulfilled();
        var issues = [];
        
        if(conditionsFulfilled.length > 0){
          var self = this;
          
          conditionsFulfilled.forEach(function(condition){
            var arguments = condition.fields.map(function(field){
              if(!field.filters){
                return self.model.get(field.name);
              }else{
                return self.getFilteredValuesFromField(field);
              }
            });

            if(!self[condition.validation].apply(self, arguments)){
              condition.fields.forEach(function(field){
                issues.push({
                  field: field.name,
                  validation: condition.alias || condition.validation
                })
              });
            }

          });
        }      

        return issues;
      },
      getConditionsFulfilled: function(){
        var conditions = this.extractConditionsFromBindings();
        var self = this;

        conditions = _.compact(conditions.map(function(condition){
          var valid = true;
          condition.fields.forEach(function(field){
            if(!self.fieldFulfillsCondition(field)){
              valid = false;
            }
          });

          if(valid){
            return condition;
          }
        }));

        return conditions;
      },
      fieldFulfillsCondition: function(field){
        var valid = true;
        var self = this;
        if(field.exists){
          //It requests to have a field set with value
          if(!this.model.get(field.name) || !this.hasContent(this.model.get(field.name)) ){
            valid = false;
          }else if(field.filters && field.filters.length > 0){

            /*field.filters.forEach(function(filter){
              var hasContentOnTheFilter = self.hasContent(self.getFieldValue(filter, self.model.get(field.name)));
              if(!filter.exists && hasContentOnTheFilter ){
                valid = false;
              }else if(filter.exists && !hasContentOnTheFilter){
                valid = false;
              }
            });*/
            var foundValuesFiltered = this.getFilteredValuesFromField(field);
            if(!this.hasContent(foundValuesFiltered)){
              valid = false;
            }
          } 
        }else{
          //It requests to have a field empty
          if(this.model.get(field.name) && this.hasContent(this.model.get(field.name)) && !field.filters){
            //console.log('has  ontent and no want',this.hasContent(this.getFieldValue(field.nested, this.model.get(field.name))) )
            //console.log('has  ontent and no want',this.hasContent(this.getFieldValue(field.nested, this.model.get(field.name))) )
            valid = false;
          }else if(field.filters && field.filters.length > 0){
            var foundValuesFiltered = this.getFilteredValuesFromField(field);
            console.log(foundValuesFiltered)
            if(this.hasContent(foundValuesFiltered)){
              valid = false;
            }
          } 
        }
        return valid;
      },
      getFilteredValuesFromField: function(field){
        if(_.isArray(this.model.get(field.name))){
          return this.filterArrayValues(field);
        }else{
          return this.filterObjectValues(field);
        }
      },
      filterArrayValues: function(field){
        var self = this;

        return _.filter(this.model.get(field.name), function(fieldData){ 
            var valid = true;
            field.filters.forEach(function(filter){
              var value = self.getFieldValue(filter, fieldData);
              if(filter.exists){
                if(!value
                  || (filter.value && (value != filter.value) )
                  || (!filter.value && !self.hasContent(value))){

                  valid = false;
                }
              }else{
                if(value){
                  valid = false;
                }
              }
              
            });
            return valid;
          });
      },
      filterObjectValues: function(field){
        var fieldData = this.model.get(field.name);
        var valid = true;
        var self = this;

        field.filters.forEach(function(filter){
          var value = self.getFieldValue(filter, fieldData);
          if(filter.exists){
            if(!value
              || (filter.value && (value != filter.value) )
              || (!filter.value && !self.hasContent(value))){

              valid = false;
            }
          }else{
            if(value){
              valid = false;
            }
          }
        });
        return valid ? fieldData : null;
      },
      //Gets the value of the field, searching for it deep nested
      getFieldValue: function(filter, fieldData){
        var getValue = function(field, acc){
          if(!acc || !acc[field.name]){
            return null;
          }else if(field.nested && acc[field.name]){
            return getValue(field.nested , acc[field.name])
          }else{
            return acc[field.name];
          }
        }

        return getValue(filter, fieldData);
      },
      extractConditionsFromBindings: function(){
        var conditions = [];
        var self = this;
        for(var validation in this.validations){
          var condition = {};
          var fieldsString = validation;
          //Extract aliases
          var alias = this.getAliasFromConditionString(validation);
          if(alias.length > 0){
            fieldsString = validation.replace(alias+':', '');
            condition.alias = alias;
          }

          //Extract fields
          condition.fields = this.getFieldsFromFieldsString(fieldsString);

          var validations = this.validations[validation];
          
          if(typeof(validations) == 'string'){
            condition.validation = validations;
            conditions.push(condition);
          }else{

            validations.forEach(function(val){
              var cond = _.clone(condition);
              cond.validation = val;
              conditions.push(cond);
            });
          }
        }
        return conditions;
      },
      getAliasFromConditionString: function(conditionString){
        var index = conditionString.indexOf(':');
        if(index != -1){
          return conditionString.substr(0,index);
        }
        return '';
      },


      getFieldsFromFieldsString: function(fieldsString){
        var self = this;

        return fieldsString.match(/[^&]+(?=\{)\{\S+\}|[^&]+/g).map(function(field){
          
          var fieldStructure = {
            name: field
          };

          self.appendFiltersInfo(fieldStructure);

          var exists = fieldStructure.name.indexOf('!') == -1;
          fieldStructure.name = fieldStructure.name.replace('!', '');
          fieldStructure.exists = exists;


          if(fieldStructure.name.indexOf('.') != -1){
            //Has nested fields, apply transformation
            var fields = fieldStructure.name.split('.');

            //Recursive function for composing nested fields hyerarchy
            var composeNestedFieldsObject = function(fields, acc){
              var remaining = fields.splice(1);
              acc.name = fields[0];
              
              if(remaining.length == 0){

              var indexOfEqual = acc.name.indexOf('=');
              if(indexOfEqual != -1){
                var returningName = acc.name.substr(0, indexOfEqual);
                fieldStructure.value = acc.name.substr(indexOfEqual+1,acc.name.length).replace(/\"/g,'');
                acc.name = returningName;
              }  
                return acc;
              }else{
                acc.nested = composeNestedFieldsObject(remaining, {});
                return acc;
              }
            }

            composeNestedFieldsObject(fields, fieldStructure);
          }else{
            var indexOfEqual = fieldStructure.name.indexOf('=');
            if(indexOfEqual != -1){
              var returningName = fieldStructure.name.substr(0, indexOfEqual);
              fieldStructure.value = fieldStructure.name.substr(indexOfEqual+1,fieldStructure.name.length).replace(/\"/g,'');
              fieldStructure.name = returningName;
            }  
          }


          return fieldStructure;
        });
      },

      //Clean the filters ex:'field{filter=xxx}'' info from a field
      removeFiltersStringFromField: function(field){
        var re = /{([^}]*)}/;
        var match = re.exec(field)[0];
        return field.replace(match, '');
      },

      appendFiltersInfo: function(obj){
        var filters = this.getFiltersFromField(obj.name);
        if(filters){
          obj.filters = filters;
          obj.name = this.removeFiltersStringFromField(obj.name);
        }
      },

      //Returns an array of fields that Compose a filter ex:'field{filter=xxx}''
      getFiltersFromField: function(field){
        var re = /{([^}]*)}/;
        
        if(re.test(field)){
          var match = re.exec(field)[1];
          var fields = this.getFieldsFromFieldsString(match);
          return fields;
        }else{
          return null;
        }
      },

      validate: function(){
        var issues = _.compact(Array.prototype.concat(this.checkRequiredFields(), this.customValidations()));
        return issues.length > 0 ? issues  : null
      }
    });

    //Version
    BackboneValidator.VERSION = "<% VERSION %>";

    // Expose through Backbone object.
    Backbone.validator = BackboneValidator;

    return BackboneValidator;
}));