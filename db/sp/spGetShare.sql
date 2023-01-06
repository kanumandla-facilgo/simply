DROP PROCEDURE IF EXISTS spGetShare;

DELIMITER //

CREATE  PROCEDURE `spGetShare`(
                  OUT errorcode       INT, 
                  OUT errormsg        VARCHAR(512),
                    _salt    VARCHAR(32),
                    _document_id    INT
               )
    DETERMINISTIC
main: BEGIN

/*
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
        SET errorcode = @errno; 
    END;
*/

    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
         SET errorcode  = -300;
         SET errormsg   = 'Error';
         ROLLBACK;
     END;

     SET errorcode  = 0;
     SET errormsg   = 'Success';

    SELECT id,
        document_id,
        sysdocumenttypes_id,
        access_code,
        salt,
        companies_id,
        users_id,
        expired_at,
        created,
        last_updated
    FROM   customer_shares 
    WHERE  document_id = _document_id
    AND    access_code    = MD5(CONCAT('A9074#321', _document_id, _salt, 'Arihant'))
    AND    expired_at > NOW();

END
//
DELIMITER ;