DROP PROCEDURE IF EXISTS spUpdateCategory;

delimiter //

CREATE PROCEDURE spUpdateCategory
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _id             INT,
                     _code           VARCHAR(16),
                     _name           VARCHAR(32),
                     _accounting_key VARCHAR(32),
                     _parentid       INT,
                     _imageurl       VARCHAR(256),
                     _ishidden       INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound    INT;
 	DECLARE  l_parentid    INT;
 	DECLARE  l_name        VARCHAR(32);
 	DECLARE  l_lineage     VARCHAR(256);
 	DECLARE  l_lineagename VARCHAR(1024);
 	DECLARE  l_origname    VARCHAR(32);
 	DECLARE  l_origlineage VARCHAR(256);
 	DECLARE  l_origlineagename VARCHAR(1024);
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;

/*
    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;
*/
 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

 	-- validate name
 	IF (SELECT EXISTS (SELECT 1 FROM categories WHERE companies_id = _companyid AND name = _name AND id <> _id)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Category with same name already exists!';
		LEAVE main;
	
	END IF;

	IF _parentid IS NULL THEN

		SET errorcode  = -101;
		SET errormsg   = 'Parent ID must be passed!';
		LEAVE main;
	
	END IF;

	SELECT parent_id, lineage, lineage_name, name
	INTO   l_parentid, l_origlineage, l_origlineagename, l_origname
	FROM   categories c
	WHERE  c.id            = _id
	AND    c.companies_id  = _companyid;

	IF l_notfound = 1 THEN

		SET errorcode  = -200;
		SET errormsg   = 'Category not found!';
		LEAVE main;

	END IF;

	SET _code = TRIM(UPPER(_code));

	-- check if code is already exists with other category
	IF (SELECT EXISTS (SELECT 1 FROM categories c WHERE c.id <> _id AND c.code = _code AND c.companies_id = _companyid)) THEN

		SET errorcode  = -204;
		SET errormsg   = 'Code already exists!';
		LEAVE main;

	END IF;

	IF l_parentid <> _parentid THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = _parentid AND c.companies_id = _companyid)) THEN

			SET errorcode  = -202;
			SET errormsg   = 'Parent ID not found!';
			LEAVE main;
	
		END IF;

		IF (SELECT EXISTS (SELECT 1 FROM categories c WHERE c.id = _parentid AND c.companies_id = _companyid AND is_leaf = true AND children_count > 0)) THEN

			SET errorcode  = -203;
			SET errormsg   = 'Product already exists under the new parent!';
			LEAVE main;
	
		END IF;
		
		IF (SELECT EXISTS (SELECT 1 FROM categories c WHERE c.id = _parentid AND c.lineage LIKE CONCAT(l_origlineage, _id, '|', '%'))) THEN

			SET errorcode  = -204;
			SET errormsg   = 'Circular chain detected. Parent ID cannot be in same tree!';
			LEAVE main;

		END IF;

		SELECT lineage, lineage_name, name
		INTO   l_lineage, l_lineagename, l_name
		FROM   categories c
		WHERE  c.id            = _parentid;

		IF l_lineage = '' THEN
			SET l_lineage = '|';
		END IF;
	
		IF l_lineagename = '' THEN
			SET l_lineagename = '~';
		END IF;

		UPDATE categories
		SET    lineage      = CONCAT(l_lineage, _parentid, '|'),
		       lineage_name = CONCAT(l_lineagename, l_name, '~'),
		       parent_id    = _parentid,
		       last_updated = NOW()
		WHERE id = _id;
		
		UPDATE categories
		SET    lineage      = REPLACE(lineage, l_origlineage, CONCAT(l_lineage, _parentid, '|')),
		       lineage_name = REPLACE(lineage_name, l_origlineagename, CONCAT(l_lineagename, l_name, '~')),
		       last_updated = NOW()
		WHERE  lineage like CONCAT(l_origlineage, _id, '|', '%');

		UPDATE categories
		SET    children_count  = children_count + 1,
		       is_leaf         = 0,
		       last_updated    = NOW()
		WHERE  id = _parentid;

		-- update root & leaf etc
		UPDATE  categories
		SET     children_count = children_count - 1,
 		        last_updated   = NOW()
		WHERE   id             = l_parentid;

		UPDATE  categories
		SET     is_leaf      = CASE WHEN children_count = 0 THEN 1 ELSE 0 END,
		        last_updated = NOW()
		WHERE   id           = l_parentid;
	
	END IF;
	
	UPDATE categories
	SET    image_url    = _imageurl,
	       name         = _name,
	       accounting_key = _accounting_key,
	       code         = _code,
	       is_hidden    = _ishidden,
	       last_updated = NOW()
	WHERE  id = _id;

	-- update child categories lineage name if name changed
	IF l_origname <> _name THEN

		UPDATE categories
		INNER JOIN categories c1 ON c1.id = categories.parent_id AND c1.id = _id
		SET    categories.lineage_name = CONCAT(c1.lineage_name, _name, '~'),
		       categories.last_updated = NOW()
		WHERE  categories.parent_id = _id;

	END IF;

END;
// 
delimiter ;
