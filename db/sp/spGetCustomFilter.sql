DROP PROCEDURE IF EXISTS spGetCustomFilter;

delimiter //

CREATE PROCEDURE spGetCustomFilter
            (
                OUT errorcode           INT, 
                OUT errormsg            VARCHAR(512),
                OUT _totalrecords       INT,
                    _companyid          INT,
                    _id                 INT,
                    _userid             INT,
                    _document_type      INT,
                    _show_in_dashboard  INT
            )
DETERMINISTIC
READS SQL DATA

main: BEGIN
    DECLARE offsetrecords  INT;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
        SET errorcode = @errno; 
    END;

/*
    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
         SET errorcode  = -300;
         SET errormsg   = 'Error';
         ROLLBACK;
     END;
*/
    SET errorcode  = 0;
    SET errormsg   = 'Success';
    
    SELECT SQL_CALC_FOUND_ROWS cf.*
    FROM custom_filters cf
    WHERE cf.companies_id = CASE WHEN _companyid = 1 THEN cf.companies_id ELSE _companyid END
        AND   CASE WHEN _id IS NOT NULL THEN cf.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
        AND   CASE WHEN _userid IS NOT NULL THEN cf.users_id ELSE 1 END = CASE WHEN _userid IS NOT NULL THEN _userid ELSE 1 END 
        AND   CASE WHEN _document_type IS NOT NULL THEN cf.sysdocumenttypes_id = _document_type ELSE 1 = 1 END
        AND   CASE WHEN _show_in_dashboard IS NOT NULL THEN cf.show_in_dashboard = _show_in_dashboard ELSE 1 = 1 END
        AND   active = 1
    ORDER BY`rank`, last_updated DESC;
    
    SELECT FOUND_ROWS() INTO _totalrecords;
    
END;
// 
delimiter ;
