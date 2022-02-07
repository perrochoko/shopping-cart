// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Accordion } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{cartList}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    ListGroup,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  
  // Fetch Data

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    let newStock;
    let newItems = items.map((item) => {
        //se agregan productos al carro comprobando la existencia de stock
      if (item.name == name && item.instock > 0) {
        newStock = item.instock - 1;
        item.instock -= 1;
      }
      return item;
    });
    setItems([...newItems]);
    if (newStock >= 0) setCart([...cart, ...item]);
    //doFetch(query);
  };
  
//Retorno del productos
const deleteCartItem = (index) => {
  let newCart = cart.filter((item, i) => index != i);
  let returnedItem = cart.filter((item, i) => i == index);
  let newItems = items.map((item) => {
    if(item.name == returnedItem[0].name) item.instock += 1;
    return item;
  });
  setCart(newCart);
  setItems(newItems);

};
  // const photos = ["apple.png", "orange.png", "beans.jpg", "cabbage.jpg"];
  
  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <Card key={index}>
        <Image src={url} width={80} roundedCircle></Image>
        <Button variant="info" size="large">
          <li>
          {item.name}  ${item.cost}
          </li>
          <li>
          Country: "{item.country}"
          </li>
          <li>
          Stock: {item.instock}
          </li>
        </Button>
        <Button variant="warning" size="large" name={item.name} onClick={addToCart}>
          Add to Cart
        </Button>
      </Card>
    );
  });

 
  let cartList = cart.map((item, index) => {
    return (
      <Card className="m-2" key={1 + index}>
      <Accordion.Item eventkey={1 + index}>
      <Accordion variant="link" eventkey={1 + index}>
      {item.name}
      </Accordion>
      <Accordion.Body eventkey={1 + index}>
      From {item.country}: ${item.cost}
      <hr />
      <Button type="button" className="btn danger"
      onClick={() => deleteCartItem(index)}
      eventkey={1 + index}>
      Delete
      </Button>
      </Accordion.Body>
      </Accordion.Item>
      </Card>
    );
  });


  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <ListGroup.Item
        key={index} 
        index={index}>
        {item.name}: ${item.cost}
        </ListGroup.Item>
      );
    });
    return { final, total };
  };



  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal.toFixed(2);
  };



  // TODO: implement the restockProducts function
  //reestableciendo el stock de la lista sin adjuntar mas items, solo restableciendo el stock
  const restockProducts = (url) => {
    doFetch(url);
    var tempArray = JSON.parse(JSON.stringify(data));
    let restock = tempArray.map((item) => {
      return item;
    });
    setItems([...restock]);
  };

  return (
    <Container>
      <Row>
        <Col xs={3}>
                <Row>

                <form
                  onSubmit={(event) => {
                    restockProducts(`${query}`);
                    console.log(`Restock called on ${query}`);
                    event.preventDefault();
                  }}
                >
                  <Button className="btn-warning" type="submit">ReStock Products</Button>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    // type="hidden"
                  />
                </form>
                </Row>

          <Card className="card border-primary m-1">
          <Card.Header>Stock</Card.Header>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
          </Card>
        </Col>


        <Col>
          <Card className="text-center border-info m-1 card">
          <Card.Header>Cart</Card.Header>
          <Accordion>{cartList}</Accordion>
          </Card>
        </Col>


        <Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
        </Col>


      </Row>


    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));