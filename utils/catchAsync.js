export default (fn) => {
  //when a route invoked the catchAsync function will return the anonymous function that will call the fn function
  return (req, res, next) => {
    // The async funcion passed to the catchAsync function will be called here and the error will be handled in the catch method with the next function what will be send to the globalErrorHanlder in the app.js
    //fn will return a promise
    fn(req, res, next).catch(next);
  };
};
