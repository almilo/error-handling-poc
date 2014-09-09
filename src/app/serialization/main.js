angular.module('serialization', [])
    .constant('normalizedDeserializer', function (data) {
        var dependencies = data.dependencies;

        return {
            headers: data.headers,
            data: deserializePayload(data.payload)
        };

        function deserializePayload(payload) {
            if (_.isArray(payload)) {
                return _.map(payload, deserializePayload);
            }

            if (_.isObject(payload)) {
                var deserializedObject = _.reduce(payload, function (result, propertyValue, propertyName) {
                    var propertyIsReference = _.isObject(propertyValue) && getPropertyValue(propertyValue, '_shape') === 'reference';

                    result[propertyName] = propertyIsReference ? deserializeReference(propertyValue) : deserializePayload(propertyValue);

                    return result;
                }, {});

                return cleanProperties(deserializedObject, ['_type', '_shape']);
            }

            return payload;
        }

        function deserializeReference(serializedObject) {
            var type = getPropertyValue(serializedObject, '_type'),
                id = getPropertyValue(serializedObject, 'id'),
                objectsOfType = dependencies[type],
                referencedObject = objectsOfType && _.isObject(objectsOfType) && objectsOfType[id];

            if (!referencedObject) {
                throw new Error('Object of type: "' + type + '" with id: "' + id + '" not found in: "' + JSON.stringify(dependencies) + '".');
            }

            return cleanProperties(deserializePayload(referencedObject), ['_type']);
        }

        function getPropertyValue(serializedObject, propertyName) {
            var attributeValue = serializedObject[propertyName];

            if (!attributeValue) {
                throw new Error('Error deserializing object: "' + JSON.stringify(serializedObject) + '", no attribute: "' + propertyName + '" specified.');
            }

            return attributeValue;
        }

        function cleanProperties(deserializedObject, propertyNames) {
            propertyNames = _.isString(propertyNames) ? [propertyNames] : propertyNames;

            _.each(propertyNames, function (propertyName) {
                delete deserializedObject[propertyName];
            });

            return deserializedObject;
        }
    })
    .config(function ($httpProvider, normalizedDeserializer) {
        $httpProvider.defaults.transformResponse.push(deserializeResponse);

        function deserializeResponse(data) {
            var deserializer = getDeserializer(data);

            return deserializer(data);
        }

        function getDeserializer(data) {
            var deserializers = {
                    normalized: normalizedDeserializer
                },
                deserializer = _.isObject(data) && data._type === 'Result' ? deserializers[data.format] : _.identity;

            if (!deserializer) {
                throw new Error('No deserializer could be found for format: "' + data.format + '".');
            }

            return deserializer;
        }
    });
