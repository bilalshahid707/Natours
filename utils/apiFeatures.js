class APIFeatures {
    constructor(query, queryObject,Model) {
      this.query = query;
      this.queryObject = queryObject;
      this.model=Model
    }
    filter() {
      const queryObject = { ...this.queryObject };
      const excludedFields = ['page', 'limit', 'sort', 'fields'];
      excludedFields.forEach((el) => delete queryObject[el]);
      //  executing query
      let queryStr = JSON.stringify(queryObject);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
      this.query = this.model.find(JSON.parse(queryStr));
      return this;
    }
    sort() {
      if (this.queryObject.sort) {
        this.query = this.query.sort(this.queryObject.sort);
      }
      return this;
    }
    pagination() {
      if (this.queryObject.page) {
        const page = this.queryObject.page * 1 || 1;
        this.query = this.query.skip(5 * (page - 1)).limit(5);
      }
      return this;
    }
    limitFields() {
      if (this.queryObject.fields) {
        let fields = this.queryObject.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      }
      return this;
    }
    limitToTopFive() {
      if (this.queryObject.limit) {
        this.query = this.query.limit(5);
      }
      return this;
    }
  }
module.exports = APIFeatures