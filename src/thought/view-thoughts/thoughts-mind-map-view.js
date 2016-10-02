console.debug('thoughts-mind-map-view.js');
define([
    'router'
], function(
    router
) {
    console.debug('vis.js: ', vis);

    var thoughts = [];

    return {
        set: set,
        render: render
    };

    function set(p_thoughts) {
        thoughts = p_thoughts;
    }
    
    function render() {
        console.debug('redner!');
     // create an array with nodes
        //var nodes = new vis.DataSet([
        //    {id: 1, label: 'Node 1'},
        //    {id: 2, label: 'Node 2'},
        //    {id: 3, label: 'Node 3'},
        //    {id: 4, label: 'Node 4'},
        //    {id: 5, label: 'Node 5'}
        //]);

        console.debug('thoughts: ', thoughts);

        var visDataSet = thoughts.map(function(thought, index) {
            return { id: thought.id, label: thought.name };
        });
        var visEdges = [];
        _.each(thoughts, function(thought) {
            console.log('thought.children: ', thought.children);
            _.each(thought.children, function(childThought) {
                console.log('pushing children');
                visDataSet.push({ id: childThought.id, label: childThought.name });
                visEdges.push({
                    from: thought.id,
                    to: childThought.id
                });
            });
        });

        console.debug('visDataSet: ', visDataSet);
        console.debug('visEdges: ', visEdges);
        var nodes = new vis.DataSet(visDataSet);

        // create an array with edges
        var edges = new vis.DataSet(visEdges);

        // create a network
        var container = document.getElementById('thoughts-container');

        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };

        var options = {
          interaction: {
            navigationButtons: true,
            keyboard: true
          }
        };

        // initialize your network!
        var network = new vis.Network(container, data, options);

        initializeContextMenu(container, network, nodes);
    }

    /**
     * Initialize context menu, that appears when clicking on thought.
     */
    function initializeContextMenu(container, network, nodes) {
        var menu = document.createElement('div');
        menu.innerHTML = '<div><i class="fa fa-plus-circle fa-big"></i> add thought</div>';
        menu.style.fontSize = '16px';
        menu.style.border = '1px solid black';
        menu.style.cursor = 'pointer';
        menu.style.padding= '5px';
        menu.style.backgroundColor = '#fff';
        menu.style.position = 'absolute';
        menu.style.display = 'none';
        container.appendChild(menu);
        //container.addEventListener('click', showContextMenu);
        
        menu.addEventListener('click', createThought);

        function showContextMenu(x, y) {
            console.log('x: ', x, 'y: ', y);
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';
            menu.style.display = 'block';
            //document.addEventListener('click', removeMenu);
        }

        function removeContextMenu() {
            console.log('removing menu');
            menu.style.display = 'none';
            //menu.style.display = 'none';
            //menu.parentNode.removeChild(menu);
            //document.removeEventListener('click', removeMenu);
        }

        var menuIsShown;
        var targetThought;
        network.on('click', function(event) {
            var x = event.event.center.x;
            var y = event.event.center.y;
            console.log('x: ', x, 'y: ', y);
            if (menuIsShown) {
                removeContextMenu();
                menuIsShown = false;
            } else {
                if (event.nodes.length > 0) {
                    targetThought = getTargetThought(event);
                    showContextMenu(x, y);
                    menuIsShown = true;
                }
            }

        });

        function getTargetThought(networkEvent) {
            console.log('network click event: ', networkEvent);
            var targetNodeId = networkEvent.nodes[0];
            console.log('targetNodeId: ', targetNodeId);
            var targetNode = nodes.get(targetNodeId);
            console.log('targetNode: ', targetNode);
            var targetThoughtName = targetNode.label;
            console.log('targetThoughtName: ', targetThoughtName);
            targetThought = { id: targetNodeId };
            //var targetThought = _.findWhere(thoughts, { name: targetThoughtName });
            console.log('targetThought: ', targetThought);
            return targetThought;
        }

        function createThought() {
            console.log('redirecting to create-thought. TargetThought: ', targetThought);
            router.go('create-thought', {
                parentThought: targetThought
            });
        }
    }

});
