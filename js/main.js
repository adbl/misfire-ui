function ViewModel() {
    var self = this;
    self.uri = 'http://localhost:4000/counters';
    self.counters = ko.observableArray();
    self.values_uri_template = null;

    self.ajax = function(uri, method, data) {
        var request = {
            url: uri,
            type: method,
            // accepts: accept,
            contentType: "application/vnd.api+json",
            cache: false,
            data: JSON.stringify(data),
            // dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus + "\n" + errorThrown + "\n\n" +
                            jqXHR.status + " " + jqXHR.statusText + "\n" +
                            jqXHR.getAllResponseHeaders() + "\n" +
                            jqXHR.responseText);
            }
        };
        return $.ajax(request);
    }

    self.ajax(self.uri, 'GET').done(function(data) {
        self.counter_values_uri = function(counter) {
            return data.links['counters.values'].replace(
                "{counters.id}", counter.id())
        }

        for (var i = 0; i < data.counters.length; i++) {
            self.counters.push({
                id: ko.observable(data.counters[i].id),
                name: ko.observable(data.counters[i].name),
                type: ko.observable(data.counters[i].type)
            });
        }
    });

    self.doCount = function(counter) {
        console.log("doCount: " + counter.name());
        data = {"values": [
            {"value": 1, "timestamp": (new Date).toISOString()}]};
        self.ajax(self.counter_values_uri(counter), 'POST', data).done(
            function(data) {
                console.log(data);
            }
        );
    }
    self.beginAdd = function() {
        console.log("beginAdd");
    }
}
ko.applyBindings(new ViewModel(), $('#main')[0]);
