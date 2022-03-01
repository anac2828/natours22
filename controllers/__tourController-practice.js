const fs = require('fs');

// *********** DATA **************
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// MIDDLEWARE Handler for use in the tourRoute.js
exports.checkID = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  console.log(req.body);
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'You need a name and price to create a tour.',
    });
  }
  next();
};

// ************* TOUR ROUTE HANDLERS ***************
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === +req.params.id);

  res.status(200).json({ status: 'success', data: { tour } });
};

exports.createTour = (req, res) => {
  const tourId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: tourId }, req.body);
  tours.push(newTour);

  fs.writeFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours)
  );
  res.status(201).json({ status: 'success', message: 'Tour created.' });
};

exports.updateTour = (req, res) => {
  const updatedTours = tours.map((tour) => {
    if (tour.id === +req.params.id) {
      for (const property in req.body) {
        tour[property] = req.body[property];
      }
    }
    return tour;
  });

  fs.writeFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours)
  );

  res.status(200).json({
    status: 'success',
    data: { tour: tours.find((tour) => tour.id === +req.params.id) },
  });
};

exports.deleteTour = (req, res) => {
  const index = tours.findIndex((tour) => tour.id === +req.params.id);

  tours.splice(index, 1);

  fs.writeFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours)
  );

  res.status(200).json({
    status: 'success',
    message: 'Deleted tour.',
  });
};
