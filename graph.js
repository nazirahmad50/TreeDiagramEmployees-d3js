const dims = {height:500, width: 1100};
const cent = {x:(dims.width / 2 + 5), y:(dims.height / 2 + 5)};

const svg = d3.select(".canvas").append("svg")
    .attr("width", dims.width + 100) 
    .attr("height", dims.width + 100)

const graph = svg.append("g")
    .attr("transform", "translate(50,50)");

// data stratifiy
const stratify = d3.stratify() // convert data into hierachle format so d3 can work with
    .id(d => d.name)
    .parentId(d => d.parent);

// tree
const tree = d3.tree()
    .size([dims.width, dims.height]);

// ordinal scale
const colors = d3.scaleOrdinal(d3.schemeAccent);

const update = (data) => {

    graph.selectAll(".node").remove();
    graph.selectAll(".link").remove();

    colors.domain(data.map(item => item.department))

    const rootNode = stratify(data); //root node with all the elemetns nested inside it

    const treeData = tree(rootNode);

    // get nodes selection and join data
    const nodes = graph.selectAll(".node")
        .data(treeData.descendants());

    // get link selection and join data
    const links = graph.selectAll(".link") // the link between the nodes
        .data(treeData.links());

    links.enter().append("path")
        .attr("class", ".link")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 2)
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );


    // create enter node groups
    const enterNodes = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // append rects to each enter node
    enterNodes.append("rect")
        .attr("fill", d => colors(d.data.department))
        .attr("stroke", "#555")
        .attr("stroke-width", 2)
        .attr("height", 50)
        .attr("width",d => d.data.name.length * 20)
        .attr("transform", d => {
            var x = d.data.name.length * 10;
            return `translate(${-x}, -25)`;
        });

    // append name text
    enterNodes.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => d.data.name)

}


var data = []

db.collection("employees").onSnapshot(res =>{

    res.docChanges().forEach(change =>{

        const doc = {...change.doc.data(), id:change.doc.id};
        
        switch (change.type) {
            case "added":
                data.push(doc)
                break;
            case "modified":
                const index = data.findIndex(item => item.id !== doc.id)
                data[index] = doc;
                break;
            case "removed":
                data = data.filter(item => item.id !== doc.id);
                break;
        
            default:
                break;
        }
    });

    update(data);

})