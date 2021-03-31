CREATE TYPE comment_category AS ENUM (
  'expression', 
  'release', 
  'rejoice', 
  'embrace'
);

ALTER TABLE hello_comment
  ADD COLUMN
    category comment_category;