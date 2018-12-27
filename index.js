const _ = require('lodash');
const {Validator, Rule} = require('@cesium133/forgjs');

const isNestedArray = (a) => 'nested_array' === a.type;
const isNestedObject = (a) => 'nested_object' === a.type;
const isNestedDefinition = (a) => isNestedArray(a) || isNestedObject(a);
const hasNestedDefinitions = (m) => !!(_.find(m.attributes, ['type', 'nested_array']) || _.find(m.attributes, ['type', 'nested_object']));

const hasPlainObject = (o) => !!_.findKey(o, _.isPlainObject);
const forgify = (o) => {
	let keys = _.keys(o);
	for (let k of keys) {
		let insert, v = _.get(o, k);
		if (_.isPlainObject(v)) {
			if (hasPlainObject(v)) {
				if ('array' === v.type) {
					insert = new Rule(forgify(v));
				} else {
					insert = new Validator(forgify(v));
				}
			} else {
				if (v.type) {
					insert = new Rule(v);
				} else {
					insert = new Validator(v);
				}
			}
		} else {
			if ('boolean' === v) {
				insert = new Rule(v);
			}
		}

		if (insert) {
			_.set(o, k, insert);
		}
	}
	o = _.pick(o, keys);
	return o;
};

const convert = (model) => {
	model.nestedValidations = {};
	let names = _.keys(model.attributes);
	for (let n of names) {
		let a = model.attributes[n];

		if (isNestedDefinition(a)) {
			if (isNestedArray(n)) {
				a.type = 'array';
				model.nestedValidations[n] = forgify(a);
			} else {
				if (isNestedObject(n)) {
					model.nestedValidations[n] = forgify(a.of);
				}
			}

			a.type = 'json';
			model.attributes[n] = _.omit(a, ['of']);
		}
	}
	return model;
};

const carryOn = (values, proceed, previous) => _.isFunction(previous) ? previous(values, proceed) : proceed();

const validateNested = (rules, values) => {
	let errors = [];
	let keys = _.keys(values);
	_.each(keys, (key) => {
		let rule = rules[key];
		let value = values[key];
		if (rule && value && !rule.test(value)) {
			errors.push('Failed validation for ' + key + '.');
		}
	});
	return errors;
};

const validate = (model, values, proceed, previous) => {
	let rules = model.nestedValidations;
	let errors = validateNested(rules, values);
	if (!_.isEmpty(errors)) {
		return proceed(_.join(errors, ', '));
	}
	return carryOn(values, proceed, previous);
};

module.exports = (sails) => {
	return {
		defaults: {},

		initialize: function (done) {
			sails.after(['hook:sockets:loaded'], function () {
				_.each(sails.models, (model) => {
					if (!model.globalId || !hasNestedDefinitions(model)) {
						return;
					}

					model = convert(model);

					let previousBeforeUpdate = model.beforeUpdate;
					model.beforeUpdate = (values, proceed) => validate(model, values, proceed, previousBeforeUpdate);

					let previousBeforeCreate = model.beforeCreate;
					model.beforeCreate = (values, proceed) => validate(model, values, proceed, previousBeforeCreate);

					// TODO: add beforeBulkUpdate override, see http://docs.sequelizejs.com/manual/tutorial/hooks.html#model-hooks
					// let previousBeforeBulkUpdate = model.beforeBulkUpdate;
					// model.beforeBulkUpdate = (options) => {};

					// TODO: add beforeBulkCreate override, see http://docs.sequelizejs.com/manual/tutorial/hooks.html#model-hooks
					// let previousBeforeBulkCreate = model.beforeBulkCreate;
					// model.beforeBulkCreate = (instances, options) => {};
				});

				done();
			});
		}
	}
};