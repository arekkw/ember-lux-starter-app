import Ember from 'ember';

export default Ember.Component.extend({
  ajax: Ember.inject.service(),

  oldPassword: '',
  newPassword: '',
  newPasswordRepeat: '',

  errorMessage: '',

  testPasswordStrength: Ember.computed('newPassword.length', function () {
    const strength = this.get('newPassword.length')/16*100;
    return strength > 100 ? 100 : strength;
  }),

  newPasswordsMatch: Ember.computed(
    'newPassword',
    'newPasswordRepeat',
    function(){
      // return true if no password repeat was filled in yet
      return this.get('newPasswordRepeat')
        ? this.get('newPassword') === this.get('newPasswordRepeat')
        : true;
    }
  ),

  passwordWarning: Ember.computed(
    'testPasswordStrength',
    'newPasswordsMatch',
    'newPassword.length',
    function(){
      let message = [];

      if(this.get('newPassword.length') && this.get('testPasswordStrength') < 50){
        message.push('Your password must be at least 8 characters long');
      }

      if(!this.get('newPasswordsMatch')){
        message.push(`The passwords don't match`);
      }

      return message;
    }
  ),

  saveIsDisabled: Ember.computed(
    'testPasswordStrength',
    'oldPassword.length',
    'newPassword',
    'newPasswordRepeat',
    function () {
      return !(
           this.get('testPasswordStrength') >= 50
        && this.get('newPassword') === this.get('newPasswordRepeat')
        && this.get('oldPassword.length')
      );
    }
  ),

  actions: {
    save() {
      const data = {
        "old-password": this.get('oldPassword'),
        "new-password": this.get('newPassword')
      };

      return this.get('ajax').post('/auth/change-password', {
        data: {
          "data": {
            "type": "auth",
            "attributes": data
          }
        }
      }).then(() => {
        this.set('oldPassword', '');
        this.set('newPassword', '');
        this.set('newPasswordRepeat', '');
      }).catch(() => {
        this.set('errorMessage', 'Failed to save password.');
      });
    }
  }
});
