class APIFeatures {
  constructor(query, userQueryObj) {
    this.query = query;
    this.userQueryObj = userQueryObj;
  }

  filter() {
    const queryObj = { ...this.userQueryObj };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // ************* Advanced filtering
    // conver to string to be able to replace the "gte" with a "$" at the beggining for mongodb to work
    let queryString = JSON.stringify(queryObj);
    //'g' at the end will replace all intances
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // Don't use await here to allow for chaining
    this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.userQueryObj.sort) {
      // replace ',' with a 'space' for mongodb to work when there are more than one sort values

      const sortBy = this.userQueryObj.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
      // mongodb sort format
      // sort('price ratingsAverate')
    } else this.query = this.query.sort('-createdAt');
    return this;
  }
  limitFields() {
    if (this.userQueryObj.fields) {
      const fields = this.userQueryObj.fields.split(',').join(' ');
      // Shows only the fields selected
      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');
    return this;
  }
  pagination() {
    //if there is no page the default is 1

    const page = +this.userQueryObj.page || 1;
    const limit = +this.userQueryObj.limit || 100;
    // page=3&limit=10, results 1-10 page 1, 11-20 page 2, 21-30 page 3. In this example the 20 results will be skiped and page 3 results will be shown.
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
