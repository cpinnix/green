# Green

Green is designed to categorize and analyze personal financial data. It was built out of frustration with existing applications and an interest in understanding the data from ground level. This project originally started as a closed source project, but after a couple years of iterations, I decided to open source it. The program continues to be my primary method of analyzing my own financial data.

🙇 ~ Charlie.

## Three Parts

Green is made of three parts: [ETL](etl/README.md) (extract transform load), [API](api/README.md) and [front end](frontend/README.md). Each part is standalone; separated into individual packages and dependencies. In a nutshell, the ETL application reads .csv files and writes a normalized transaction file, the API application serves data to the frontend with GraphQL, and the frontend provides an interface to the data.

## Installation

Clone this repository to your local system.

## Configuration

Configuration files should live in the root directory.

### Input / Output

Input and output configurations tell Green where to find your source .csv files and where to put the normalized transaction file.

Example `green-input.csv` file:

```
/Users/username/personal-finances/data
```

`green-input.csv` is a .csv file that Green uses to recursively find all source .csv files.

Example `green-output.csv` file:

```
csv,/Users/username/personal-finances/output/transactions.csv
json,/Users/username/personal-finances/output/transactions.json
```

`green-output-csv` is a .csv file that tells Green where to put the .csv and .json transactions after transformation.

### Transformers

Given that there is no standard column order for financial data downloaded from institutions, Green needs a way to extract data into a consistent column order. Transformers are functions that extract data from an individual row and returns a new row with a consistent column order. A configuration file is needed to map directories to transformers where each directory should have .csv files for the target transformer. _Keep in mind that .csv column order might differ from within the same institution as well._

Example `green-transformers.csv` file:

```
chase/1234,chaseBankAccount
chase/3245,chaseBankAccount
chase/5678,chaseCreditAccount
chase/9078,chaseCreditAccount
chase/8887,chaseCreditAccount
venmo,venmo
```

`green-input.csv` tells Green where to find input files, while `green-transformers.json` tells Green which transformer functions should be used to transform data within subdirectories inside input directories. _You can see above that different transformers are used within the same institution._ There are only a handful of transformers available, but more could easily be added in [the ETL code](etl/transformers).

### Tags

Green runs on tags. `green-tags.csv` matches regular expressions or transaction hashes to tags.

Example `green-tags.csv` file:

```
BACKBLAZE,utilities
NETLIFY,utilities
```

Tags are loaded in the front end application and applied to transactions for analysis.
