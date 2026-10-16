# Spam Email Detection with Multiple Classifiers

This project trains multiple machine learning classifiers to detect whether an email is spam or not spam, including Naive Bayes, Decision Tree, and Random Forest.

The dataset has two columns:

- `text`: the email content
- `spam`: the label, where `1` means spam and `0` means not spam

## Algorithms Used

### Naive Bayes
- **Description**: A probabilistic classifier based on Bayes' theorem, assuming independence between features. Uses MultinomialNB for text classification.
- **Pros**: Fast training, works well with high-dimensional data like text.
- **Cons**: Assumes feature independence, which may not hold for complex text.

### Decision Tree
- **Description**: Builds a tree by recursively splitting data based on feature values to minimize impurity. Uses DecisionTreeClassifier from sklearn.
- **Pros**: Interpretable, handles non-linear relationships.
- **Cons**: Prone to overfitting, especially on noisy data.

### Random Forest
- **Description**: An ensemble of multiple decision trees, averaging predictions to reduce overfitting. Uses RandomForestClassifier with 100 estimators.
- **Pros**: Robust, handles overfitting better than single trees, good generalization.
- **Cons**: Slower training, less interpretable than single trees.

## Project Structure

```text
Spam_Email_Naive_Bayes/
|-- data/
|   |-- raw/
|   |   `-- emails.csv
|   `-- processed/
|       |-- train.csv
|       |-- validation.csv
|       `-- test.csv
|-- models/
|   |-- naive_bayes_model.pkl
|   |-- decision_tree_model.pkl
|   |-- random_forest_model.pkl
|   `-- vectorizer.pkl
|-- notebooks/
|   |-- 01.basic_eda.ipynb
|   |-- 02_data_split.ipynb
|   `-- 03_train_naive_bayes.ipynb
|-- reports/
|   |-- classification_report.txt
|   |-- decision_tree_classification_report.txt
|   |-- random_forest_classification_report.txt
|   |-- accuracy_comparison.png
|   `-- project_report.docx
|-- scripts/
|   |-- main.py
|   |-- split_data.py
|   |-- train_model.py
|   |-- train_decision_tree.py
|   |-- train_random_forest.py
|   |-- predict.py
|   `-- generate_project_report.py
`-- requirements.txt
```

## Setup

Create and activate a virtual environment.

```powershell
python -m venv venv
venv\Scripts\activate
```

Install the required packages.

```powershell
pip install -r requirements.txt
```

## Full Process

### 1. Put Raw Data in the Project

The original dataset should be stored here:

```text
data/raw/emails.csv
```

The CSV must contain these columns:

```text
text,spam
```

Example:

```text
"Subject: free offer...",1
"Subject: meeting update...",0
```

### 2. Explore the Dataset

Use this notebook:

```text
notebooks/01.basic_eda.ipynb
```

This notebook checks:

- dataset shape
- column names
- missing values
- spam and not spam count
- sample spam emails
- sample not spam emails

To run it:

```powershell
jupyter notebook
```

Then open `notebooks/01.basic_eda.ipynb` and run the cells from top to bottom.

### 3. Convert Raw Data to Processed Data

Use this notebook first:

```text
notebooks/02_data_split.ipynb
```

This notebook reads:

```text
data/raw/emails.csv
```

Then it splits the data into:

- `70%` train data
- `20%` validation data
- `10%` test data

It saves the processed files here:

```text
data/processed/train.csv
data/processed/validation.csv
data/processed/test.csv
```

The split uses `stratify=df["spam"]`, so the spam/not spam ratio stays almost the same in train, validation, and test.

Current split:

```text
Train:      4009 rows
Validation: 1146 rows
Test:        573 rows
```

You can also generate the processed data from the terminal:

```powershell
python scripts/split_data.py
```

### 4. Train the Models

#### Naive Bayes Model

Use this notebook:

```text
notebooks/03_train_naive_bayes.ipynb
```

Or from the terminal:

```powershell
python scripts/train_model.py
```

#### Decision Tree Model

From the terminal:

```powershell
python scripts/train_decision_tree.py
```

#### Random Forest Model

From the terminal:

```powershell
python scripts/train_random_forest.py
```

All scripts do these steps:

1. Loads `train.csv`, `validation.csv`, and `test.csv`.
2. Separates features and labels:
   - `X_train = train_df["text"]`
   - `y_train = train_df["spam"]`
3. Converts email text into word-count features using `CountVectorizer`.
4. Fits the vectorizer only on training data.
5. Transforms validation and test data using the same vectorizer.
6. Trains the classifier (MultinomialNB, DecisionTreeClassifier, or RandomForestClassifier).
7. Checks validation accuracy.
8. Checks final test accuracy.
9. Saves the trained model and vectorizer.

Important:

```python
X_train_vec = vectorizer.fit_transform(X_train)
X_val_vec = vectorizer.transform(X_val)
X_test_vec = vectorizer.transform(X_test)
```

The vectorizer should be fitted only on train data. Validation and test data should only be transformed. This prevents data leakage.

After training, these files are created:

```text
models/naive_bayes_model.pkl
models/decision_tree_model.pkl
models/random_forest_model.pkl
models/vectorizer.pkl
reports/classification_report.txt
reports/decision_tree_classification_report.txt
reports/random_forest_classification_report.txt
```

### 5. Model Evaluation and Comparison

The training scripts evaluate each model on train, validation, and test data.

Current results:

- **Naive Bayes**:
  - Train Accuracy:      0.9970
  - Validation Accuracy: 0.9930
  - Test Accuracy:       0.9843

- **Decision Tree**:
  - Train Accuracy:      1.0000
  - Validation Accuracy: 0.9572
  - Test Accuracy:       0.9616

- **Random Forest**:
  - Train Accuracy:      1.0000
  - Validation Accuracy: 0.9852
  - Test Accuracy:       0.9773

To generate a comprehensive report with accuracy graphs:

```powershell
python scripts/generate_project_report.py
```

This creates `reports/project_report.docx` and `reports/accuracy_comparison.png`.

### 6. Prediction

Use the prediction script to classify new emails:

```powershell
python scripts/predict.py
```

This loads the trained models and vectorizer, takes user input, and predicts spam/not spam.

## Python Scripts Overview

- `split_data.py`: Splits raw data into train/validation/test CSVs.
- `train_model.py`: Trains Naive Bayes model.
- `train_decision_tree.py`: Trains Decision Tree model.
- `train_random_forest.py`: Trains Random Forest model.
- `predict.py`: Loads models and predicts on new text.
- `generate_project_report.py`: Generates a Word document report with results and graphs.
- `main.py`: General entry point (may be unused).
```

Test confusion matrix:

```text
[[430   6]
 [  3 134]]
```

Meaning:

- `430`: not spam emails correctly predicted as not spam
- `6`: not spam emails incorrectly predicted as spam
- `3`: spam emails incorrectly predicted as not spam
- `134`: spam emails correctly predicted as spam

The full evaluation report is saved here:

```text
reports/classification_report.txt
```

### 6. Predict a New Email

After training, use:

```powershell
python scripts/predict.py "Congratulations, you won free money. Click here to claim now."
```

Example output:

```text
Prediction: Spam (1)
Not spam probability: 0.0022
Spam probability: 0.9978
```

Another example:

```powershell
python scripts/predict.py "Please review the meeting notes and send your feedback."
```

Expected result:

```text
Prediction: Not Spam (0)
```

## Run the Complete Pipeline

From the project root, run:

```powershell
python scripts/split_data.py
python scripts/train_model.py
python scripts/predict.py "Limited time offer, claim your free prize now."
```

## Notebook Workflow

If you want to run everything using notebooks:

1. Open Jupyter Notebook.

```powershell
jupyter notebook
```

2. Run `notebooks/01.basic_eda.ipynb` to understand the raw data.
3. Run `notebooks/02_data_split.ipynb` to create train, validation, and test files.
4. Run `notebooks/03_train_naive_bayes.ipynb` to train and evaluate the model.
5. Check the saved files in `models/` and `reports/`.

## Script Workflow

If you want to run everything using Python scripts:

```powershell
python scripts/split_data.py
python scripts/train_model.py
```

Then predict:

```powershell
python scripts/predict.py "Your email text here"
```

## Notes

- Always split the data before training.
- Train the vectorizer only on training data.
- Use validation data to check model quality during development.
- Use test data only for the final model evaluation.
- If `models/naive_bayes_model.pkl` or `models/vectorizer.pkl` is missing, run `python scripts/train_model.py` again.
