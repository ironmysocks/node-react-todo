import React from "react";
import { Card, CardHeader, CardBody, Form, Input, ListGroup, ListGroupItem } from "reactstrap";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.state = {
      todos: "",
      error: "",
      loaded: false
    };
  }

  componentDidMount() {
    this.getList();
  };

  async getList() {
    const response = await this.callApi("/api/todos");
    this.updateState(response);
  };

  async addItem(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    if (data.get("description").length <= 0 || data.get("priority").length <=0 || data.get("priority") <= 0) {
      this.setState({
        error: "Description and priority are required. Priority must be greater than 0."
      });
    } else {
      const params = {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          description: data.get("description"),
          priority: data.get("priority")
        })
      };
      const response = await this.callApi("/api/todo", params);
      document.getElementById("description").value = "";
      document.getElementById("priority").value = "";
      this.updateState(response);
    }
  };

  async deleteItem(id) {
    const response = await this.callApi("/api/todo/" + id, { method: "DELETE" });
    this.updateState(response);
  };

  async callApi(url, params = {}) {
    const response = await fetch(url, params);
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  getCounts(todos) {
    const result = [];
    todos.forEach( (t) => {
      if (result[t.priority] === undefined) {
        result[t.priority] = 0;
      }
      result[t.priority]++;
    });
    return result;
  }

  getMissing(counts) {
    const missing = [];
    for(let i = 0; i<counts.length - 1; i++) {
      if (counts[i] === undefined) {
        missing.push(i);
      }
    }
    return missing;
  }

  updateState(response) {
    let counts = [];
    let missing = [];
    if (response.todos && response.todos.length > 0) {
      counts = this.getCounts(response.todos);
      missing = this.getMissing(counts);
    }

    this.setState({
      todos: response.todos && response.todos.length > 0 ? response.todos : null,
      error: response.error ? response.error : "",
      counts,
      missing,
      loaded: true
    });
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading...</div>;
    }

    const renderItem = (item, k) => (
      <ListGroupItem key={k}>
        {item.description} ({item.priority}) {"  "}
        <button onClick={()=>this.deleteItem(k)}>Done</button>
      </ListGroupItem>
    );

    const renderCounts = (v, k) => {
      if (v > 1) {
        return <div>Priority {k} was used {v} times</div>;
      }
    };
    return (
      <Card style={{width:"40%", paddingTop: "100px", marginRight: "auto", marginLeft: "auto"}}>
        <CardHeader tag="h3">To Do List</CardHeader>
        <CardBody>
        {this.state.counts ? this.state.counts.map(renderCounts) : ""}
        {this.state.missing ? this.state.missing.map((m) => <div>Priority {m} is missing</div>) : ""}
        {this.state.error ? this.state.error : ""}
        <ListGroup>
          {this.state.todos ? this.state.todos.map((t, k) => renderItem(t, k)) : ""}
        </ListGroup>
        <Form onSubmit={this.addItem}>
        <Input type="text" id="description" name="description" placeholder="What do you need to do?" />
        <Input type="text" id="priority" name="priority" placeholder="Priority?"/>
        <button>Add</button>
        </Form>
        </CardBody>
      </Card>
    );
  }
}

export default App;
